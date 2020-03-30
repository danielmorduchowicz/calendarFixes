<?php
require_once('DBConnect_WPLocal.php');

return;

echo $_REQUEST["key"];
echo serialize(json_decode($_REQUEST["dates"]));
$k=$_REQUEST["key"];
$datesInstance=serialize(json_decode($_REQUEST["dates"]));

$QUpdate =
  "
  UPDATE
    wp_postmeta
  SET
    meta_value = '$datesInstance'
  WHERE
    meta_id = '$k'
    ";

echo $QUpdate;

$R = $conn->query($QUpdate);

if(!$R = $conn->query($QUpdate)){
    die('There was an error running the query [' . $conn->error . ']');
    }






$newDates=$_REQUEST['newDatesArray'];


foreach ($_REQUEST as $key => $value) {
  /*echo $value."\n";*/
  $valueAsArray=json_decode($value);
  foreach ($valueAsArray as $k => $v) {
    /*echo($k)."<br>".serialize($v);*/
    $datesInstance = serialize ($v);

    $QUpdate =
      "
      UPDATE
        wp_postmeta
      SET
        meta_value = '$datesInstance'
      WHERE
        meta_id = '$k'
        ";


    $R = $conn->query($QUpdate);

    if(!$R = $conn->query($QUpdate)){
        die('There was an error running the query [' . $conn->error . ']');
        }
  }


}




?>
