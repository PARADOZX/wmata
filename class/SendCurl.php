<?php

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

?>