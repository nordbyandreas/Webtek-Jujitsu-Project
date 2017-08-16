<?php

$mainHeading = "Photo gallery";
$HTMLcontent = <<< EOT
<div id="gallery">
EOT;

$relatedName1 = "Our schedule";
$relatedLink1 = "schedule";

$relatedName2 = "Where to find us";
$relatedLink2 = "roadmap";

/* Gallery specific information ------------------------------|
|------------------------------------------------------------*/

foreach(scandir('images/photos/thumbs') as $file)
  if($file != '..' && $file != '.')
    $HTMLcontent .= '
  <a target="_blank" href="images/photos/'.$file.'">
    <img alt="Thumbnail" src="images/photos/thumbs/'.$file.'">
  </a>';

$HTMLcontent .= '
</div>';