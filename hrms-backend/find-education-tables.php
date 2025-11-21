<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = DB::select('SHOW TABLES');
echo "Tables related to education/qualification:\n";
foreach($tables as $t) {
    $name = array_values((array)$t)[0];
    if(stripos($name, 'qual') !== false || stripos($name, 'education') !== false || stripos($name, 'degree') !== false || stripos($name, 'academic') !== false) {
        echo "  - $name\n";
        $cols = DB::select("DESCRIBE $name");
        foreach($cols as $c) {
            if(stripos($c->Field, 'employee') !== false) {
                echo "    → Has employee field: {$c->Field}\n";
            }
        }
    }
}

echo "\nTables with 'employee' in name:\n";
foreach($tables as $t) {
    $name = array_values((array)$t)[0];
    if(stripos($name, 'employee') !== false) {
        echo "  - $name\n";
    }
}
