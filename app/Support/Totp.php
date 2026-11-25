<?php

namespace App\Support;

/**
 * Time-based one-time passwords (RFC 6238), compatible with Google Authenticator,
 * Microsoft Authenticator, Authy etc. 6 digits, 30-second steps, SHA-1.
 */
class Totp
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /** New random secret, base32 encoded (160 bits). */
    public static function secret(): string
    {
        return self::base32Encode(random_bytes(20));
    }

    /** Code for a given time step. */
    public static function code(string $secret, ?int $step = null): string
    {
        $step ??= intdiv(time(), 30);
        $hash = hash_hmac('sha1', pack('N*', 0, $step), self::base32Decode($secret), true);
        $offset = ord($hash[19]) & 0x0F;
        $value = ((ord($hash[$offset]) & 0x7F) << 24) | (ord($hash[$offset + 1]) << 16) | (ord($hash[$offset + 2]) << 8) | ord($hash[$offset + 3]);

        return str_pad((string) ($value % 1000000), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Checks a code, allowing one step of clock drift either way.
     * Returns the matching time step (so it can be refused if used again), or null.
     */
    public static function verify(string $secret, string $code, ?int $lastStep = null): ?int
    {
        $code = preg_replace('/\D+/', '', $code);
        if (strlen($code) !== 6) {
            return null;
        }
        $now = intdiv(time(), 30);
        foreach ([0, -1, 1] as $drift) {
            $step = $now + $drift;
            if ($lastStep !== null && $step <= $lastStep) {
                continue; // each code works only once
            }
            if (hash_equals(self::code($secret, $step), $code)) {
                return $step;
            }
        }

        return null;
    }

    /** otpauth:// link shown as a QR code to the authenticator app. */
    public static function uri(string $secret, string $account, string $issuer = 'AAS School Manager'): string
    {
        return 'otpauth://totp/'.rawurlencode($issuer.':'.$account).'?'.http_build_query([
            'secret' => $secret, 'issuer' => $issuer, 'algorithm' => 'SHA1', 'digits' => 6, 'period' => 30,
        ], '', '&', PHP_QUERY_RFC3986);
    }

    private static function base32Encode(string $bytes): string
    {
        $bits = '';
        foreach (str_split($bytes) as $c) {
            $bits .= str_pad(decbin(ord($c)), 8, '0', STR_PAD_LEFT);
        }
        $out = '';
        foreach (str_split($bits, 5) as $chunk) {
            $out .= self::ALPHABET[bindec(str_pad($chunk, 5, '0'))];
        }

        return $out;
    }

    private static function base32Decode(string $text): string
    {
        $text = strtoupper(preg_replace('/[^A-Za-z2-7]/', '', $text));
        $bits = '';
        foreach (str_split($text) as $c) {
            $bits .= str_pad(decbin(strpos(self::ALPHABET, $c)), 5, '0', STR_PAD_LEFT);
        }
        $out = '';
        foreach (str_split($bits, 8) as $byte) {
            if (strlen($byte) === 8) {
                $out .= chr(bindec($byte));
            }
        }

        return $out;
    }
}
