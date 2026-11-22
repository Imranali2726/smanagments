<?php

namespace App\Support;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Streams rows as a CSV file that opens directly in Excel (UTF-8 with BOM, so Urdu text works).
 * Nested arrays (e.g. loaded relations) are flattened to "relation.field" columns.
 */
class CsvExport
{
    public static function download(iterable $rows, string $name): StreamedResponse
    {
        $flat = [];
        foreach ($rows as $row) {
            $row = $row instanceof Arrayable ? $row->toArray() : (array) $row;
            $flat[] = static::flatten($row);
        }

        $headers = [];
        foreach ($flat as $row) {
            foreach (array_keys($row) as $key) {
                $headers[$key] = true;
            }
        }
        $headers = array_keys($headers);
        $filename = Str::slug($name).'-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($flat, $headers) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, array_map(fn ($h) => Str::headline(str_replace('.', ' ', $h)), $headers));
            foreach ($flat as $row) {
                fputcsv($out, array_map(fn ($h) => $row[$h] ?? '', $headers));
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    protected static function flatten(array $row, string $prefix = '', int $depth = 0): array
    {
        $result = [];
        foreach ($row as $key => $value) {
            $column = $prefix === '' ? (string) $key : $prefix.'.'.$key;
            if (is_array($value)) {
                // Skip lists (has-many relations); flatten single related records two levels deep.
                if ($depth < 2 && ! array_is_list($value)) {
                    $result += static::flatten($value, $column, $depth + 1);
                } elseif (array_is_list($value) && $value && ! is_array($value[0])) {
                    $result[$column] = implode(', ', $value);
                }
            } elseif (is_bool($value)) {
                $result[$column] = $value ? 'Yes' : 'No';
            } else {
                $result[$column] = $value;
            }
        }

        return $result;
    }
}
