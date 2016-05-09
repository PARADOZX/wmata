# Made To Fit

Made to Fit is an extremely lightweight Javascript program that arranges and shifts the positions of elements smoothly employing CSS transitions based on the size of the browser window.  

## Installation

Installation is easy.  Simply clone Made To Fit `git clone https://github.com/PARADOZX/made_to_fit.git` to the appropriate directory. The last step is to include the javascript file *made_to_fit.js* in your HTML using the 'script' tag.

The only dependency is jQuery.

## Usage

<strong>HTML</strong>

1. Create the HTML elements.  HTML element rules are as follows:
  - You can create any number of elements.
  - Elements must all share the same dimensions (width and height).
  - Percentages must not be used for the width and height.  
  - Elements must all have a class attribute and be of the same class.  You can choose any name for the class.

2. All the elements must be placed within a single container.  The container must be assigned an 'id'.  This 'id' can be of your choosing.  For instance:
```
<div id="fit-container">
  <div class="fit"></div>
  <div class="fit"></div>
  <div class="fit"></div>
</div> //end container
```
<strong>JAVASCRIPT</strong>

3. Create a MadeToFit object using the MadeToFit constructor.  `var mtf = new MadeToFit();`

4. The HTML elements must be registered using setElement method.  The setElement method takes a jQuery collection as the argument.  For instance, if the elements were assigned a class of 'fit' it would look like this:  `mtf.setElement($(".fit"));` 

5. The container must be registered using the setContainer method.  The method takes a jQuery selector as the argument. `mtf.setContainer($("#fit-container"));`  

6. Set the dimensions of the elements by using the setElementDimensions method.  If the element widths are 200px and heights are 100px: `mtf.setElementDimensions(200, 100)`  *auto-detection will be featured in the next version*

7. Finally, call init method.  `mtf.init()`


<strong>OPTIONS</strong>

Options are passed into MadeToFit constructor as JSON object.  `var mtf = new MadeToFit({triggerPoint:100, elementsHide:true});`


* __autoHeight__ - _Adjusts the container in which all the elements are wrapped.  Since elements are of absolute positioning the container's height will not be automatically adjusted to accommodate space for your elements.  By setting this option to 'true' the container's height will be adjusted automatically (up or down) to create a nice space to fit your elements._  

  Default: `{autoHeight : true}`  
  
  Option values (bool):  
    true - autoHeight enabled  
    false - autoHeight disabled

* __centerLeftovers__ - _MadeToFit displays your elements in rows with an equal amount of elements in each row as long as there are enough elements to completely fill the rows.  If there are not enough elements to completely fill the last row centerLeftovers auto sets the margins to create a look of symmetry._  

  Default: `{centerLeftovers : true}`  
  
  Option values (bool):  
    true - centerLeftovers enabled  
    false - centerLeftovers disabled

* __tBuffer__ - _tBuffer (top buffer) allows you to set the buffer (or margin) between the element rows in pixels._  

  Default: `{tBuffer : 60}`  
  
  Option values (integer):  
    Any integer may be used.  

* __elementsHide__ - _Sets the positions of the elements just outside of the browser window alternating from left to right effectively "hiding" the elements from view.  A visual effect is achieved when elements are "unhidden" as the elements all move into their respective positions from out of view._  

  Default: `{elementsHide : false}`  
  
  Option values (bool):  
    true - elementsHide enabled; when set to true and triggerPoint is not set elements will "unhide" when page loads.
    false - elementsHide disabled

* __triggerPoint__ - _Only set this option when `{elementsHide:true}`.  A trigger point is a point on the top/down scroll of the page.  When the user scrolls past this trigger point the hidden elements reveal themselves._  

  Default: `{triggerPoint : null}`  
  
  Option values (number):  
    
    Example : 
    `{triggerPoint : 900}` The user set elementsHide option to true.  When the user scrolls and hits 900px on the Y-scroll the trigger point activates which unhides the hidden elements.
    
* __responsive__ - _If you implemented responsive design and resized your elements based on the width of the screen you will need to register the breakpoints and the sizes of the elements in the 'responsive' option array.  You may add as many breakpoints to the array as you desire._  

  `{responsive : [screen_width, element_width, element_height]}`  single breakpoint  
  
  `{responsive : [ [screen_widthA, element_widthA, element_heightA] , [screen_widthB, element_widthB, element_heightB] ]}`  multiple breakpoints  
  
  Default: `{responsive : []}`  
  
  Option values:  
    screen_width (number) - screen width where breakpoint is set  
    element_width (number) - element's width in px for that particular breakpoint  
    element_height (number) - element's height in px for that particular breakpoint  
  
  Example: 
  `{responsive : [450, 200, 100]}`  In this scenario the user implemented a responsive design such as using a CSS media query that changes the element's width to 200px and height to 100px when max screen is 450px.  The user must now register the breakpoint at 450px with the element's width and height. 
  

## Credits

TODO: Write credits

## License

TODO: Write license
