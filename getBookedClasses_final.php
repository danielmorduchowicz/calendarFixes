<?php
require_once('DBConnect_WPLocal.php');

$Q =  "
        SELECT  ID
        FROM wp_posts
        WHERE
        `post_type`
        LIKE 'ajde_events'

      ";

mysqli_query($conn,$Q);

$R = $conn->query($Q);

if(!$R = $conn->query($Q)){
    die('There was an error running the query [' . $conn->error . ']');
    }


$responseArray=array();
$counter=0;
while($row = $R->fetch_assoc()){
  $postID=$row['ID'];
  /*fetch repeat intervals. Can't figure out a better way to do this due to the complicated nature of a wordpress database*/
  $QrepeatInterval="SELECT
              meta_id,meta_value as 'repeat_intervals'
              FROM
                wp_postmeta
              WHERE
                post_id = $postID

              AND
                meta_key='repeat_intervals'
            ";

    $RMetaData = $conn->query($QrepeatInterval);
    while($rowMeta=$RMetaData->fetch_assoc()){
      $metaID=$rowMeta['meta_id'];
      $dates=unserialize($rowMeta['repeat_intervals']);
      $responseArray[$counter]['meta_id']= $metaID;
      $responseArray[$counter]['dates']= $dates;
    }
    /*fetch subtitle*/
    $QsubTitle="SELECT
                meta_value as 'post_shortTitle'
                FROM
                  wp_postmeta
                WHERE
                  post_id = $postID

                AND
                  meta_key='evcal_subtitle'
              ";

      $RsubTitle = $conn->query($QsubTitle);
      while($rowSubTitle=$RsubTitle->fetch_assoc()){
        $subTitle = $rowSubTitle['post_shortTitle'];
        $responseArray[$counter]['post_subtitle']= $subTitle;
      }

$responseArray[$counter]["post_id"]=$row['ID'];
$counter++;
}
echo json_encode($responseArray);


?>
