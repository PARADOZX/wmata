<?php

define('api_key', '6b700f7ea9db408e9745c207da7ca827');
class SendCurl
{
	protected $curl;
	protected $returntransfer;

	public function __construct($url, $returntransfer)
	{
		$this->curl = curl_init();
		$this->returntransfer = $returntransfer;
		curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, $returntransfer);
		curl_setopt($this->curl, CURLOPT_URL,$url);
		curl_setopt($this->curl, CURLOPT_HTTPHEADER, array(
            "api_key : " . api_key
            ));
	}
	public function exec()
	{
		if(curl_errno($this->curl)) {
		    echo 'Curl error: ' . curl_error($this->curl);
		} else {
			$response = curl_exec($this->curl);
		}		

		curl_close($this->curl);

		if($this->returntransfer) return $response;	
	}
}


	
	$id = 'D3';

	// $curl = new SendCurl("https://api.wmata.com/Incidents.svc/json/BusIncidents?Route=D4", true);
	$curl = new SendCurl("https://api.wmata.com/Incidents.svc/json/BusIncidents?", true);
	$schedule = $curl->exec();

    // foreach($schedule as $inc)
    // {
    //     echo $inc . "<br/>";
    // }
    
    // $schedule = json_decode($schedule);
    // $arr = $schedule->BusIncidents;
    
    
    
    // echo is_array($arr);
    // echo $arr[0];
    // foreach($arr as $key=>$value)
    // {
    //     echo $arr[$key] . "<br/>";
    // }
    
	print_r($schedule);
?>