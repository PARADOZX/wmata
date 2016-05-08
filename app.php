<?php

include 'includes/config.inc.php';

if(!isset($_GET['action'])) {
	//error handling
} 

$action = $_GET['action'];

if($action === 'routes') {

	function parseRoutes($route_array)
	{
		foreach ($route_array as $key => $value) {
			if (preg_match('/([a-z]{1,})/', $value['RouteID'])) {		
				unset($route_array[$key]);
			}
		}
		return $route_array;
	}

	$curl = new SendCurl("http://api.wmata.com/Bus.svc/json/jRoutes?api_key=6b700f7ea9db408e9745c207da7ca827", true);
	$routes = $curl->exec();

	$routes = json_decode($routes, true);
	$routes = $routes['Routes'];

	$parsedRoutes = parseRoutes($routes);

	print_r(json_encode($parsedRoutes));

} else if ($action === 'position') {

	if (!isset($_GET['id'])) {
		//error handling
	} 

	$id = $_GET['id'];

	$curl = new SendCurl("http://api.wmata.com/Bus.svc/json/jBusPositions?routeId={$id}&includingVariations=false&api_key=6b700f7ea9db408e9745c207da7ca827", true);
	$position = $curl->exec();

	print_r($position);

} else if ($action === 'busroute') {
	if (!isset($_GET['id'])) {
		//error handling
	}  

	$id = $_GET['id'];

	$date = date('Y-m-d');

	$curl = new SendCurl("http://api.wmata.com/Bus.svc/json/jRouteDetails?routeId=$id&$date&api_key=6b700f7ea9db408e9745c207da7ca827", true);
	$position = $curl->exec();

	print_r($position);
}


	

?>