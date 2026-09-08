<?php

namespace App\Console\Commands;

use App\Services\GoogleDriveService;
use Illuminate\Console\Command;

class TestGoogleDriveCommand extends Command
{
    protected $signature = 'drive:test {name=TestFolder}';
    protected $description = 'Test Google Drive API authentication and create a test folder';

    public function handle(GoogleDriveService $driveService): int
    {
        $this->info('Testing Google Drive Connection...');
        $status = $driveService->getStatus();

        $this->table(
            ['Key', 'Value'],
            [
                ['Is Configured', $status['is_configured'] ? 'YES' : 'NO'],
                ['Auth Mode', $status['auth_mode']],
                ['Service Account Email', $status['service_account_email'] ?: 'N/A'],
                ['Root Folder ID', $status['root_folder_id'] ?: 'N/A'],
                ['Root Folder URL', $status['root_folder_url'] ?: 'N/A'],
            ]
        );

        if (!$status['is_configured']) {
            $this->error('Google Drive is not configured! Please provide service_account.json or OAuth credentials.');
            return 1;
        }

        $folderName = $this->argument('name');
        $this->info("Attempting to create folder '{$folderName}' in Google Drive root...");

        $folder = $driveService->createOrGetFolder($folderName);
        if ($folder) {
            $this->info("Folder created / verified successfully!");
            $this->line("Folder ID: " . $folder['id']);
            $this->line("Folder Link: " . $folder['webViewLink']);
            return 0;
        } else {
            $this->error("Failed to create folder in Google Drive. Check credentials and folder permissions.");
            return 1;
        }
    }
}