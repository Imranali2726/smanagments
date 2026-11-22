<?php

namespace App\Support;

use Illuminate\Validation\DatabasePresenceVerifier;

/**
 * Makes "unique" and "exists" validation rules look only inside the current
 * school, so one school can never reference or clash with another's records.
 * Only user e-mails stay unique across the whole platform (they are logins).
 */
class TenantPresenceVerifier extends DatabasePresenceVerifier
{
    protected ?string $column = null;

    public function getCount($collection, $column, $value, $excludeId = null, $idColumn = null, array $extra = [])
    {
        $this->column = $column;

        return parent::getCount($collection, $column, $value, $excludeId, $idColumn, $extra);
    }

    public function getMultiCount($collection, $column, array $values, array $extra = [])
    {
        $this->column = $column;

        return parent::getMultiCount($collection, $column, $values, $extra);
    }

    protected function table($table)
    {
        $query = parent::table($table);
        $name = str_contains($table, '.') ? substr($table, strrpos($table, '.') + 1) : $table;
        $global = $name === 'users' && $this->column === 'email';

        if (($id = Tenant::id()) && ! $global && in_array($name, Tenant::TABLES, true)) {
            $query->where('school_id', $id);
        }

        return $query;
    }
}
