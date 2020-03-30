<?php
require_once('DBConnect_WPLocal.php');
$k=$_REQUEST["key"];
$tempArray=json_decode($_REQUEST["dates"]);
/*Get dates for this meta_key*/
$QrepeatInterval =
      "
        SELECT
          meta_value
        FROM wp_postmeta
        WHERE
          meta_id = $k
          and
          meta_key = 'repeat_intervals'
      ";

    $R = $conn->query($QrepeatInterval);

    if(!$R = $conn->query($QrepeatInterval)){
        die('There was an error running the query [' . $conn->error . ']');
        }

while($row = $R->fetch_assoc()){
      $dates=unserialize($row['meta_value']);
      foreach ($tempArray as $key => $value) {
        unset($dates[array_search($value,$dates)]);
      }


}
$serializedDates=serialize($dates);

$QUpdate =
  "
  UPDATE
    wp_postmeta
  SET
    meta_value = '$serializedDates'
  WHERE
    meta_id = $k
    and
    meta_key = 'repeat_intervals'
    ";


    $RUpdate = $conn->query($QUpdate);

    if(!$RUpdate = $conn->query($QUpdate)){
        die('There was an error running the query [' . $conn->error . ']');
        }



  /*
  run through the array that came back from the browser
  unset each one one at a time
  deserialize
  Remove dates that came back from json_decode
  serialize and update database
*/

return;


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
