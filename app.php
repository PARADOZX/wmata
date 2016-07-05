<?php

include 'conf/config.inc.php';

if(!isset($_GET['action'])) return false;

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

	$curl = new SendCurl("http://api.wmata.com/Bus.svc/json/jRoutes", true);
	$routes = $curl->exec();

	$routes = json_decode($routes, true);
	$routes = $routes['Routes'];

	$parsedRoutes = parseRoutes($routes);

	print_r(json_encode($parsedRoutes));

} else if ($action === 'position') {

	if (!isset($_GET['id'])) return false;

	$id = $_GET['id'];

	$curl = new SendCurl("http://api.wmata.com/Bus.svc/json/jBusPositions?routeId={$id}&includingVariations=false", true);
	$position = $curl->exec();

	print_r($position);

} else if ($action === 'busroute') {
	if (!isset($_GET['id'])) return false;
	
	$id = $_GET['id'];

	$date = date('Y-m-d');

	$curl = new SendCurl("http://api.wmata.com/Bus.svc/json/jRouteDetails?routeId=$id&$date", true);
	$position = $curl->exec();

	print_r($position);
	
} else if ($action === 'busincidents') {
	
	//retrieve backbone collection
	$curl = new SendCurl("http://api.wmata.com/Incidents.svc/json/BusIncidents", true);
	
	$incidents = $curl->exec();
	
	print_r($incidents);
	
} else if ($action === 'busincident') {

	if (!isset($_GET['id'])) return false;
	$id = $_GET['id'];

	//retrieve backbone model 
	// $curl = new SendCurl("http://api.wmata.com/Incidents.svc/json/BusIncidents", true);
	$curl = new SendCurl("http://api.wmata.com/Incidents.svc/json/BusIncidents?Route=$id", true);

	$incident = $curl->exec();
	
	print_r($incident);
} else if ($action === 'stopschedule') {

	if (!isset($_GET['id'])) return false;
	$id = $_GET['id'];
	
	$curl = new SendCurl("http://api.wmata.com/Bus.svc/json/jStopSchedule?StopID=$id", true);

	$incident = $curl->exec();
	
	print_r($incident);
}


?>