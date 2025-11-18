<?php

namespace App\Helpers;

use Carbon\Carbon;

/**
 * Helper class for timezone conversions between IST and UTC
 * Matches legacy .NET behavior: TimeZoneInfo.FindSystemTimeZoneById("India Standard Time")
 */
class TimezoneHelper
{
    const IST_TIMEZONE = 'Asia/Kolkata';
    const UTC_TIMEZONE = 'UTC';
    
    /**
     * Convert IST time to UTC
     * Legacy equivalent: TimeZoneInfo.ConvertTimeToUtc(localDateTime, istZone)
     * 
     * @param string $time Time in HH:mm format (e.g., "09:00")
     * @param string $date Date in Y-m-d format (e.g., "2025-11-18")
     * @return string Time in HH:mm format converted to UTC
     */
    public static function istToUtc(string $time, string $date): string
    {
        if (empty($time)) {
            return '';
        }
        
        try {
            // Parse the date and time as IST
            $dateTime = Carbon::parse($date . ' ' . $time, self::IST_TIMEZONE);
            
            // Convert to UTC
            $utcDateTime = $dateTime->setTimezone(self::UTC_TIMEZONE);
            
            // Return time in HH:mm format
            return $utcDateTime->format('H:i');
        } catch (\Exception $e) {
            \Log::error('IST to UTC conversion failed', [
                'time' => $time,
                'date' => $date,
                'error' => $e->getMessage()
            ]);
            return $time; // Fallback to original time
        }
    }
    
    /**
     * Convert UTC time to IST
     * Legacy equivalent: TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, istZone)
     * 
     * @param string $time Time in HH:mm or HH:mm:ss format (e.g., "03:30" or "03:30:00")
     * @return string Time in HH:mm format converted to IST
     */
    public static function utcToIst(string $time): string
    {
        if (empty($time)) {
            return '';
        }
        
        try {
            // Parse time as UTC (use a dummy date as we only care about time)
            // Legacy uses: DateTime.TryParse($"2000-01-01T{time}")
            $dateTime = Carbon::parse('2000-01-01 ' . $time, self::UTC_TIMEZONE);
            
            // Explicitly set as UTC
            $dateTime = Carbon::createFromFormat('Y-m-d H:i:s', $dateTime->format('Y-m-d H:i:s'), self::UTC_TIMEZONE);
            
            // Convert to IST
            $istDateTime = $dateTime->setTimezone(self::IST_TIMEZONE);
            
            // Return time in HH:mm format (legacy format)
            return $istDateTime->format('H:i');
        } catch (\Exception $e) {
            \Log::error('UTC to IST conversion failed', [
                'time' => $time,
                'error' => $e->getMessage()
            ]);
            return $time; // Fallback to original time
        }
    }
    
    /**
     * Convert audit trail times from IST to UTC
     * 
     * @param array $audits Array of audit entries with 'time' field
     * @param string $date Date in Y-m-d format
     * @return array Modified audit array with UTC times
     */
    public static function convertAuditToUtc(array $audits, string $date): array
    {
        foreach ($audits as &$audit) {
            if (!empty($audit['time'])) {
                $audit['time'] = self::istToUtc($audit['time'], $date);
            }
        }
        
        return $audits;
    }
    
    /**
     * Convert audit trail times from UTC to IST
     * 
     * @param array $audits Array of audit entries with 'time' field
     * @return array Modified audit array with IST times
     */
    public static function convertAuditToIst(array $audits): array
    {
        foreach ($audits as &$audit) {
            if (!empty($audit['time'])) {
                $audit['time'] = self::utcToIst($audit['time']);
            }
        }
        
        return $audits;
    }
}
