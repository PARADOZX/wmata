<?php

function class_loader($class){
	require('class/' . $class.'.php');
}

spl_autoload_register('class_loader');

