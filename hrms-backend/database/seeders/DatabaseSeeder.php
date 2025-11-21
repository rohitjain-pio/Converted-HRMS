<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ModuleSeeder::class,
            PermissionSeeder_Legacy::class,  // Use legacy permissions
            TestUserSeeder::class,
            CountrySeeder::class,
            CitySeeder::class,  // City data must be seeded after CountrySeeder
            DepartmentSeeder::class,
            DesignationSeeder::class,
            TeamsSeeder::class,
            QualificationSeeder::class,
            DocumentTypeSeeder::class,
            EmployerDocumentTypeSeeder::class,
            AssetConditionSeeder::class,
            MenuSeeder::class,
        ]);
    }
}
