<?php
/*
 Main PHP module

 Authors: Grzegorz Swiderski
 Written: November 2015
 Version: 1.0

 This file handles the entire website structure and modularity on the server side.
 It also provides documentation about managing website content.
*/
error_reporting(0);

//Reads PHP content into variable
function requireInVar($file){
  ob_start();
  require($file);
  return ob_get_clean();
};

//Main website output
$output = requireInVar('templates/global.html');

//Function for content insertion
function templating($array){
  global $output;

  foreach($array as $name => $value)
    $output = str_replace('{{'.$name.'}}', $value, $output);
};

/* .. -- == INFORMATION ABOUT CONTENT MANAGEMENT == -- .. //
| -------------------------------------------------------- |
| ** Maintaining pages **                                  |
| Most of the maintainable content is available in the     |
| /content/ subfolder. Each PHP file contains certain data |
| necessary for displaying each page properly.             |
|                                                          |
| The following variables are found in each content file:  |
|   $mainHeading:  Title of the page in quotations         |
|   $HTMLcontent:  Content markup between EOT indicators   |
|   $relatedPage1: Name of a page shown in the sidebar     |
|   $relatedLink1: Link to a page shown in the sidebar     |
|   $relatedPage2: Name of a page shown in the sidebar     |
|   $relatedPage2: Name of a page shown in the sidebar     |
|                                                          |
| Additionally, each page also has its own heading image   |
| in the /headings/ folder. The name of the content file   |
| closely corresponds to its heading filename.             |
|                                                          |
| ** Adding new pages **                                   |
| This should be easy to do as well. Simply create a new   |
| PHP file in the /content/ folder which appropriately     |
| includes all the information described above. Make sure  |
| that the page should also have its own heading image.    |
|                                                          |
| ** Modifying other elements                              |
| Adding a new page to the menu bar shouldn't be difficult |
| either. The navigation bar is stored in the HTML file    |
| /templates/global.html, defined at the bottom.           |
| The provided structure should be easy to extend.         |
|                                                          |
| Modifying the index page might be more complicated,      |
| depending on what is to be accomplished. Its HTML        |
| resides in /templates/index.html and includes useful     |
| comments about changing its internal textual content.    |
|                                                          |
| Having said that, let's show the bulk of this module.    |
//--------------------------------------------------------*/

//Renders index if no subpage is specified
if( !isset($_GET['page']) )
  templating( array(
    'template'  => requireInVar('templates/index.html'),
    'htmltitle' => 'NTNUI Ju Jitsu',
    'script'    => '<script src="scripts/index.js"></script>'
  ));
else{
  $pageName = $_GET['page'];

  //Renders empty page if specified name doesn't exist
  if( !file_exists('content/'.$pageName.'.php') ) die();

  else{
    //Initial templating
    templating( array(
      'template'  => requireInVar('templates/generic.html'), //Below, includes a script only if it exists in /scripts/ folder
      'script'    => file_exists('scripts/'.$pageName.'.js') ? '<script src="scripts/'.$pageName.'.js"></script>' : ''
    ));
    //Load and insert the content
    require('content/'.$pageName.'.php');
    templating( array(
      'title'     => $mainHeading,
      'htmltitle' => $mainHeading.' | NTNUI Ju Jitsu',
      'heading'   => $pageName,
      'content'   => $HTMLcontent,
      'more1'     => $relatedName1,
      'more2'     => $relatedName2,
      'link1'     => '?page='.$relatedLink1,
      'link2'     => '?page='.$relatedLink2
    ));
  };
};

//Display the finished webpage
echo $output;

?>