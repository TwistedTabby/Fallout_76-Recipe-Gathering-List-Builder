# Farming Route building and tracker

The purpose of this page is to allow for the tracking of farming routes in Fallout 76.

## Step 1: Create the ability to build the route.

- A route is built with stops
- each stop contains things to do or gain from within it
- a default set of things to get are: bobblehead, consumable, magazine, event, encouter
- a stop can contain many things to do or get and can have multiple of the same of each type.

## Step 2: Create a starting point checklist

- The checklist should be free form. For example, I always make sure I consume foods and buffs at the beginning of the route
- The checklist should also allow for taking inventory of starting points on things that you can't or don't want to remove from your inventory (for example: Sugar) so that means that i may start my route with more than 0 of something and being able to enter in the current tally after a stop on the route

## Step 3: Create an enroute capabiilty to track stops as they come up. 

- This should be built off the route creation and stop creation. Essentially we should use on-device storage to track the route.
- Each time a new route is started we start the tracker over with the contents of the route builder

## Step 4: Route completion checklist

- at the end of a route there are steps to take. For example. My route ends with picking up all the books at Summersville library, and then heading to the rusty pick to empty any legedary items, and then finally my camp to dwindle my inventory.

## Step 5: Transfer to another device.

- We should allow for a route to be exported to another device via a copy/pastable string. For example, we could use base64 encoding to make a big string. The route + stops + contents would be exported, not the record.