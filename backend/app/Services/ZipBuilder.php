<?php

namespace App\Services;

/**
 * Pure PHP Zip File Builder
 * Works on any PHP server even if php-zip / ZipArchive is not installed.
 */
class ZipBuilder
{
    private array $files = [];
    private string $centralDirectory = '';
    private int $offset = 0;

    /**
     * Add a file from local path into the ZIP.
     */
    public function addFile(string $filePath, string $localName): bool
    {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            return false;
        }

        $data = file_get_contents($filePath);
        if ($data === false) {
            return false;
        }

        $this->addFromString($localName, $data);
        return true;
    }

    /**
     * Add raw string data into the ZIP.
     */
    public function addFromString(string $localName, string $data): void
    {
        // Normalize slashes
        $name = str_replace('\\', '/', $localName);
        $name = ltrim($name, '/');

        $time = time();
        $dtime = dechex($this->unix2DosTime($time));
        $hexdtime = '\x' . $dtime[6] . $dtime[7]
                  . '\x' . $dtime[4] . $dtime[5]
                  . '\x' . $dtime[2] . $dtime[3]
                  . '\x' . $dtime[0] . $dtime[1];
        eval('$hexdtime = "' . $hexdtime . '";');

        $uncLen = strlen($data);
        $crc = crc32($data);

        // Compress if gzdeflate available
        if (function_exists('gzdeflate')) {
            $zdata = gzdeflate($data);
            $cLen = strlen($zdata);
            $method = "\x08\x00"; // Deflated
        } else {
            $zdata = $data;
            $cLen = $uncLen;
            $method = "\x00\x00"; // Stored (no compression)
        }

        // Local file header
        $fr = "\x50\x4b\x03\x04";
        $fr .= "\x14\x00"; // Version needed to extract (2.0)
        $fr .= "\x00\x00"; // General purpose bit flag
        $fr .= $method;    // Compression method
        $fr .= $hexdtime;  // Last mod time and date
        $fr .= pack('V', $crc); // CRC32
        $fr .= pack('V', $cLen); // Compressed size
        $fr .= pack('V', $uncLen); // Uncompressed size
        $fr .= pack('v', strlen($name)); // File name length
        $fr .= pack('v', 0); // Extra field length
        $fr .= $name;
        $fr .= $zdata;

        $this->files[] = $fr;

        // Central directory entry
        $cdrec = "\x50\x4b\x01\x02";
        $cdrec .= "\x00\x00"; // Version made by
        $cdrec .= "\x14\x00"; // Version needed to extract (2.0)
        $cdrec .= "\x00\x00"; // General purpose bit flag
        $cdrec .= $method;    // Compression method
        $cdrec .= $hexdtime;  // Last mod time & date
        $cdrec .= pack('V', $crc); // CRC32
        $cdrec .= pack('V', $cLen); // Compressed size
        $cdrec .= pack('V', $uncLen); // Uncompressed size
        $cdrec .= pack('v', strlen($name)); // File name length
        $cdrec .= pack('v', 0); // Extra field length
        $cdrec .= pack('v', 0); // File comment length
        $cdrec .= pack('v', 0); // Disk number start
        $cdrec .= pack('v', 0); // Internal file attributes
        $cdrec .= pack('V', 32); // External file attributes - archive bit set
        $cdrec .= pack('V', $this->offset); // Relative offset of local header
        $cdrec .= $name;

        $this->centralDirectory .= $cdrec;
        $this->offset += strlen($fr);
    }

    /**
     * Get the final ZIP content binary string.
     */
    public function getZipContent(): string
    {
        $data = implode('', $this->files);
        $cd = $this->centralDirectory;
        $count = count($this->files);

        // End of central directory record
        $eof = "\x50\x4b\x05\x06";
        $eof .= "\x00\x00"; // Number of this disk
        $eof .= "\x00\x00"; // Disk with the start of central directory
        $eof .= pack('v', $count); // Total entries in the central directory on this disk
        $eof .= pack('v', $count); // Total entries in the central directory
        $eof .= pack('V', strlen($cd)); // Size of the central directory
        $eof .= pack('V', strlen($data)); // Offset of start of central directory
        $eof .= pack('v', 0); // ZIP file comment length

        return $data . $cd . $eof;
    }

    /**
     * Save ZIP to a file on disk.
     */
    public function saveTo(string $destinationPath): bool
    {
        $dir = dirname($destinationPath);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        return file_put_contents($destinationPath, $this->getZipContent()) !== false;
    }

    /**
     * Convert UNIX timestamp to 4-byte DOS format.
     */
    private function unix2DosTime(int $unixtime = 0): int
    {
        $timearray = ($unixtime == 0) ? getdate() : getdate($unixtime);
        if ($timearray['year'] < 1980) {
            $timearray['year']    = 1980;
            $timearray['mon']     = 1;
            $timearray['mday']    = 1;
            $timearray['hours']   = 0;
            $timearray['minutes'] = 0;
            $timearray['seconds'] = 0;
        }
        return (($timearray['year'] - 1980) << 25)
            | ($timearray['mon'] << 21)
            | ($timearray['mday'] << 16)
            | ($timearray['hours'] << 11)
            | ($timearray['minutes'] << 5)
            | ($timearray['seconds'] >> 1);
    }
}
