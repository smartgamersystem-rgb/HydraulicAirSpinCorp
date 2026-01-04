<?php
// Mostrar errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

if($_SERVER["REQUEST_METHOD"] == "POST") {

    // Recibir datos del formulario y limpiar caracteres peligrosos
    $name = htmlspecialchars(trim($_POST['name']));
    $email = htmlspecialchars(trim($_POST['email']));
    $phone = htmlspecialchars(trim($_POST['phone']));
    $service = htmlspecialchars(trim($_POST['service']));
    $details = htmlspecialchars(trim($_POST['details']));

    // Carpeta donde guardaremos los TXT
    $folder = __DIR__ . "/requests";

    // Crear carpeta si no existe
    if(!is_dir($folder)){
        if(!mkdir($folder, 0777, true)){
            die("Error: No se pudo crear la carpeta requests");
        }
    }

    // Nombre único para cada archivo
    $filename = $folder . "/request_" . time() . "_" . preg_replace("/[^a-zA-Z0-9]/", "_", $name) . ".txt";

    // Contenido del archivo
    $entry = "Nombre: $name\nCorreo: $email\nTeléfono: $phone\nServicio: $service\nDetalles: $details\n-------------------------\n";

    // Guardar archivo
    if(file_put_contents($filename, $entry, LOCK_EX) === false){
        die("Error: No se pudo crear el archivo TXT");
    }

    // Opcional: enviar correo
    $to = "tucorreo@dominio.com"; // Cambia a tu correo
    $subject = "Nueva solicitud de servicio";
    $headers = "From: $email\r\n";
    @mail($to, $subject, $entry, $headers);

    // Respuesta para fetch() en JS
    http_response_code(200);
    echo json_encode(["status"=>"success","message"=>"Solicitud guardada"]);
} else {
    http_response_code(405);
    echo json_encode(["status"=>"error","message"=>"Método no permitido"]);
}
?>

