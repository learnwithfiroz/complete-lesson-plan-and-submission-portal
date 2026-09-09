<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_schema_id',
        'tracking_number',
        'applicant_name',
        'applicant_email',
        'applicant_phone',
        'data',
        'attachments',
        'status',
        'admin_notes',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'data' => 'array',
        'attachments' => 'array',
    ];

    public function schema(): BelongsTo
    {
        return $this->belongsTo(FormSchema::class, 'form_schema_id');
    }

    /**
     * Generate unique institutional tracking reference number
     */
    public static function generateTrackingNumber(string $formType = 'ADM'): string
    {
        $year = date('Y');
        $prefixMap = [
            'admission' => 'ADM',
            'job' => 'JOB',
            'tender' => 'TDR',
        ];
        $prefix = $prefixMap[strtolower($formType)] ?? strtoupper(substr($formType, 0, 3));
        
        do {
            $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 5));
            $seq = str_pad(mt_rand(100, 9999), 4, '0', STR_PAD_LEFT);
            $trackingNumber = "BSISC-{$prefix}-{$year}-{$seq}";
        } while (static::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }
}