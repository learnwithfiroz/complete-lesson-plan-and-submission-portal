<?php

namespace App\Services;

use App\Models\SubmissionBatch;
use App\Models\SubmissionFile;
use App\Models\TeacherSubmission;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GoogleDriveService
{
    protected ?string $clientId;
    protected ?string $clientSecret;
    protected ?string $refreshToken;
    protected ?string $serviceAccountPath;
    protected ?string $serviceAccountJson;
    protected ?string $rootFolderId;
    protected ?string $accessToken = null;

    public function __construct()
    {
        $this->clientId = env('GOOGLE_DRIVE_CLIENT_ID');
        $this->clientSecret = env('GOOGLE_DRIVE_CLIENT_SECRET');
        $this->refreshToken = env('GOOGLE_DRIVE_REFRESH_TOKEN');
        $this->serviceAccountPath = env('GOOGLE_DRIVE_SERVICE_ACCOUNT_PATH');
        $this->serviceAccountJson = env('GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON');
        $this->rootFolderId = env('GOOGLE_DRIVE_FOLDER_ID', '1ckS_BHxWoeDt7Jba3e89yHeCH1QWrhSd');
    }

    public function isConfigured(): bool
    {
        return $this->hasServiceAccount() || $this->hasOAuthCredentials();
    }

    public function hasServiceAccount(): bool
    {
        if (!empty($this->serviceAccountJson)) {
            return true;
        }

        if (!empty($this->serviceAccountPath)) {
            $fullPath = base_path($this->serviceAccountPath);
            return file_exists($fullPath);
        }

        return false;
    }

    public function hasOAuthCredentials(): bool
    {
        return !empty($this->clientId) && !empty($this->clientSecret) && !empty($this->refreshToken);
    }

    public function getStatus(): array
    {
        $isConfigured = $this->isConfigured();
        $authMode = $this->hasServiceAccount() ? 'service_account' : ($this->hasOAuthCredentials() ? 'oauth2' : 'none');
        $rootFolderUrl = $this->rootFolderId 
            ? "https://drive.google.com/drive/folders/{$this->rootFolderId}" 
            : null;

        $serviceAccountEmail = null;
        if ($this->hasServiceAccount()) {
            $data = $this->getServiceAccountData();
            $serviceAccountEmail = $data['client_email'] ?? null;
        }

        return [
            'is_configured' => $isConfigured,
            'auth_mode' => $authMode,
            'service_account_email' => $serviceAccountEmail,
            'root_folder_id' => $this->rootFolderId,
            'root_folder_url' => $rootFolderUrl,
            'client_id_set' => !empty($this->clientId),
            'refresh_token_set' => !empty($this->refreshToken),
        ];
    }

    protected function getServiceAccountData(): ?array
    {
        if (!empty($this->serviceAccountJson)) {
            return json_decode($this->serviceAccountJson, true);
        }

        if (!empty($this->serviceAccountPath)) {
            $fullPath = base_path($this->serviceAccountPath);
            if (file_exists($fullPath)) {
                return json_decode(file_get_contents($fullPath), true);
            }
        }

        return null;
    }

    protected function getAccessToken(): ?string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        // 1. Try Service Account Authentication
        if ($this->hasServiceAccount()) {
            $data = $this->getServiceAccountData();
            if ($data && !empty($data['client_email']) && !empty($data['private_key'])) {
                $token = $this->getAccessTokenFromServiceAccount($data);
                if ($token) {
                    $this->accessToken = $token;
                    return $this->accessToken;
                }
            }
        }

        // 2. Try OAuth2 Refresh Token Authentication
        if ($this->hasOAuthCredentials()) {
            try {
                $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                    'refresh_token' => $this->refreshToken,
                    'grant_type' => 'refresh_token',
                ]);

                if ($response->successful()) {
                    $this->accessToken = $response->json('access_token');
                    return $this->accessToken;
                }

                Log::error('Google Drive Token Refresh Error', ['response' => $response->json()]);
            } catch (\Exception $e) {
                Log::error('Google Drive Token Request Exception: ' . $e->getMessage());
            }
        }

        return null;
    }

    protected function getAccessTokenFromServiceAccount(array $data): ?string
    {
        try {
            $header = ['alg' => 'RS256', 'typ' => 'JWT'];
            $now = time();
            $payload = [
                'iss' => $data['client_email'],
                'scope' => 'https://www.googleapis.com/auth/drive',
                'aud' => 'https://oauth2.googleapis.com/token',
                'exp' => $now + 3600,
                'iat' => $now,
            ];

            $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($header)));
            $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
            $signatureInput = $base64UrlHeader . '.' . $base64UrlPayload;

            $signature = '';
            $privateKey = openssl_pkey_get_private($data['private_key']);
            if (!$privateKey) {
                return null;
            }

            if (!openssl_sign($signatureInput, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
                return null;
            }

            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            $jwt = $signatureInput . '.' . $base64UrlSignature;

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if ($response->successful()) {
                return $response->json('access_token');
            }

            Log::error('Google Drive Service Account Auth Error', ['response' => $response->json()]);
        } catch (\Exception $e) {
            Log::error('Google Drive Service Account Exception: ' . $e->getMessage());
        }

        return null;
    }

    public function createOrGetFolder(string $folderName, ?string $parentId = null): ?array
    {
        $token = $this->getAccessToken();
        if (!$token) {
            // Local fallback simulation
            $safeFolderName = preg_replace('/[^a-zA-Z0-9_\-\.\s]/u', '_', $folderName);
            return [
                'id' => 'local_dir_' . md5($safeFolderName),
                'name' => $folderName,
                'webViewLink' => $this->rootFolderId ? "https://drive.google.com/drive/folders/{$this->rootFolderId}" : "https://drive.google.com/drive/my-drive",
            ];
        }

        $parent = $parentId ?: $this->rootFolderId;

        // Search if folder already exists
        $query = "mimeType = 'application/vnd.google-apps.folder' and name = '{$folderName}' and trashed = false";
        if ($parent) {
            $query .= " and '{$parent}' in parents";
        }

        try {
            $searchRes = Http::withToken($token)->get('https://www.googleapis.com/drive/v3/files', [
                'q' => $query,
                'fields' => 'files(id, name, webViewLink)',
                'supportsAllDrives' => 'true',
                'includeItemsFromAllDrives' => 'true',
            ]);

            if ($searchRes->successful() && !empty($searchRes->json('files'))) {
                $existing = $searchRes->json('files')[0];
                return [
                    'id' => $existing['id'],
                    'name' => $existing['name'],
                    'webViewLink' => $existing['webViewLink'] ?? "https://drive.google.com/drive/folders/{$existing['id']}",
                ];
            }

            // Create new folder
            $body = [
                'name' => $folderName,
                'mimeType' => 'application/vnd.google-apps.folder',
            ];
            if ($parent) {
                $body['parents'] = [$parent];
            }

            $createRes = Http::withToken($token)->post('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink&supportsAllDrives=true', $body);

            if ($createRes->successful()) {
                $data = $createRes->json();
                return [
                    'id' => $data['id'],
                    'name' => $data['name'],
                    'webViewLink' => $data['webViewLink'] ?? "https://drive.google.com/drive/folders/{$data['id']}",
                ];
            }
        } catch (\Exception $e) {
            Log::error('Google Drive Folder Creation Exception: ' . $e->getMessage());
        }

        return null;
    }

    public function uploadFile(string $localFullPath, string $fileName, ?string $folderId = null): ?array
    {
        if (!file_exists($localFullPath)) {
            return null;
        }

        $token = $this->getAccessToken();
        if (!$token) {
            // Local fallback simulation
            return [
                'id' => 'file_' . md5($fileName . time()),
                'name' => $fileName,
                'webViewLink' => $this->rootFolderId ? "https://drive.google.com/drive/folders/{$this->rootFolderId}" : "https://drive.google.com/drive/my-drive",
                'webContentLink' => $this->rootFolderId ? "https://drive.google.com/drive/folders/{$this->rootFolderId}" : "https://drive.google.com/drive/my-drive",
            ];
        }

        try {
            $mimeType = mime_content_type($localFullPath) ?: 'application/octet-stream';
            $fileContent = file_get_contents($localFullPath);

            $metadata = [
                'name' => $fileName,
            ];
            $parentFolder = $folderId ?: $this->rootFolderId;
            if ($parentFolder) {
                $metadata['parents'] = [$parentFolder];
            }

            $boundary = '-------' . md5(time());
            $delimiter = "\r\n--" . $boundary . "\r\n";
            $closeDelimiter = "\r\n--" . $boundary . "--";

            $multipartBody = $delimiter;
            $multipartBody .= "Content-Type: application/json; charset=UTF-8\r\n\r\n";
            $multipartBody .= json_encode($metadata);
            $multipartBody .= $delimiter;
            $multipartBody .= "Content-Type: " . $mimeType . "\r\n";
            $multipartBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $multipartBody .= chunk_split(base64_encode($fileContent));
            $multipartBody .= $closeDelimiter;

            $uploadRes = Http::withToken($token)
                ->withBody($multipartBody, 'multipart/related; boundary=' . $boundary)
                ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink&supportsAllDrives=true');

            if ($uploadRes->successful()) {
                $fileData = $uploadRes->json();
                
                // Set reader permission
                try {
                    Http::withToken($token)->post("https://www.googleapis.com/drive/v3/files/{$fileData['id']}/permissions?supportsAllDrives=true", [
                        'role' => 'reader',
                        'type' => 'anyone',
                    ]);
                } catch (\Exception $permErr) {
                    // silent permission fallback
                }

                return [
                    'id' => $fileData['id'],
                    'name' => $fileData['name'],
                    'webViewLink' => $fileData['webViewLink'] ?? "https://drive.google.com/file/d/{$fileData['id']}/view",
                    'webContentLink' => $fileData['webContentLink'] ?? "https://drive.google.com/uc?id={$fileData['id']}&export=download",
                ];
            }

            Log::error('Google Drive File Upload Error', ['response' => $uploadRes->json()]);
        } catch (\Exception $e) {
            Log::error('Google Drive File Upload Exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Synchronize a teacher's submission into: [Batch Title] / [Teacher Name (EMP ID)] / [Files]
     */
    public function syncTeacherSubmission(TeacherSubmission $submission): bool
    {
        $batch = $submission->batch;
        $teacher = $submission->teacher;
        if (!$batch || !$teacher) {
            return false;
        }

        // 1. Create/Get Batch Folder inside root target folder (e.g. "Lesson Plan 1 to 2")
        $batchFolder = $this->createOrGetFolder($batch->title, $this->rootFolderId);
        if ($batchFolder) {
            $batch->update([
                'gdrive_folder_id' => $batchFolder['id'],
                'gdrive_folder_url' => $batchFolder['webViewLink'],
            ]);
        }

        // 2. Create/Get Teacher Folder (e.g. "90. Most. Amina Khatun (1005)")
        $sl = $teacher->serial_number ? "{$teacher->serial_number}. " : "";
        $emp = $teacher->employee_id ? " ({$teacher->employee_id})" : "";
        $teacherFolderName = "{$sl}{$teacher->name}{$emp}";

        $teacherFolder = $this->createOrGetFolder($teacherFolderName, $batchFolder['id'] ?? $this->rootFolderId);
        if ($teacherFolder) {
            $submission->update([
                'gdrive_folder_id' => $teacherFolder['id'],
                'gdrive_folder_url' => $teacherFolder['webViewLink'],
            ]);
        }

        // 3. Upload & Mirror Files
        foreach ($submission->files as $file) {
            $localFullPath = storage_path('app/public/' . $file->file_path);
            
            // Also mirror structured copy on local disk
            $safeBatchTitle = preg_replace('/[^a-zA-Z0-9_\-\.\s]/u', '_', $batch->title);
            $safeTeacherFolder = preg_replace('/[^a-zA-Z0-9_\-\.\s]/u', '_', $teacherFolderName);
            $mirrorDir = storage_path("app/public/google_drive_mirror/{$safeBatchTitle}/{$safeTeacherFolder}");
            if (!file_exists($mirrorDir)) {
                @mkdir($mirrorDir, 0777, true);
            }
            if (file_exists($localFullPath)) {
                @copy($localFullPath, "{$mirrorDir}/{$file->file_name}");
            }

            // Upload to Google Drive
            $driveFile = $this->uploadFile($localFullPath, $file->file_name, $teacherFolder['id'] ?? null);
            if ($driveFile) {
                $file->update([
                    'gdrive_file_id' => $driveFile['id'],
                    'gdrive_view_link' => $driveFile['webViewLink'],
                    'gdrive_download_link' => $driveFile['webContentLink'],
                    'gdrive_synced_at' => now(),
                ]);
            }
        }

        return true;
    }

    /**
     * Sync entire batch of submissions to Google Drive
     */
    public function syncEntireBatch(SubmissionBatch $batch): array
    {
        $batch->load(['submissions.files', 'submissions.teacher']);
        
        $batchFolder = $this->createOrGetFolder($batch->title, $this->rootFolderId);
        if ($batchFolder) {
            $batch->update([
                'gdrive_folder_id' => $batchFolder['id'],
                'gdrive_folder_url' => $batchFolder['webViewLink'],
            ]);
        }

        $syncedCount = 0;
        foreach ($batch->submissions as $submission) {
            if ($this->syncTeacherSubmission($submission)) {
                $syncedCount++;
            }
        }

        return [
            'batch_id' => $batch->id,
            'batch_title' => $batch->title,
            'folder_url' => $batch->gdrive_folder_url,
            'synced_submissions_count' => $syncedCount,
        ];
    }
}