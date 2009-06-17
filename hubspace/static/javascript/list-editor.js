var activate_list = function(list_name) {
   var Dom = YAHOO.util.Dom;
   var Event = YAHOO.util.Event;
   var DDM = YAHOO.util.DragDropMgr;
   var table = null;
   var tbody = null;
   YAHOO.example.DDApp = {
      init: function() {
        table = YAHOO.util.Selector.query('table#' + list_name + '_table')[0];
        tbody = YAHOO.util.Selector.query('tbody', table)[0];
        var rows = YAHOO.util.Selector.query('tr.active', tbody);
        tbody.id = table.id + '_tbody';
        new YAHOO.util.DDTarget(tbody.id);
        YAHOO.util.Dom.batch(rows, function(el) {
           new YAHOO.example.DDList(el);
        });
      },
      saveOrder: function() {
        var parseTable = function(table) {
            var out = [];
            var rows = YAHOO.util.Selector.query('tr.active', tbody);
            YAHOO.util.Dom.batch(rows, function(row) {
                out[out.length] = {'name':'order-' + jq.inArray(row, rows), 'value':row.id.split('-')[1]};
            });
            return out;
        };
        var post_array = parseTable(table);
        jq.post(jq('#relative_url').attr('class') + 'lists/reorder/' + list_name, post_array)
      },
   };
YAHOO.example.DDList = function(id, sGroup, config) {
    YAHOO.example.DDList.superclass.constructor.call(this, id, sGroup, config);
    this.logger = this.logger || YAHOO;
    var el = this.getDragEl();
    Dom.setStyle(el, "opacity", 0.67); // The proxy is slightly transparent
    this.goingUp = false;
    this.lastY = 0;
};

YAHOO.extend(YAHOO.example.DDList, YAHOO.util.DDProxy, {
    startDrag: function(x, y) {
        this.logger.log(this.id + " startDrag");

        // make the proxy look like the source element
        var dragEl = this.getDragEl();
        var clickEl = this.getEl();
        Dom.setStyle(clickEl, "visibility", "hidden");
        dragEl.innerHTML = clickEl.innerHTML;
        Dom.setStyle(dragEl, "color", Dom.getStyle(clickEl, "color"));
        Dom.setStyle(dragEl, "backgroundColor", Dom.getStyle(clickEl, "backgroundColor"));
        Dom.setStyle(dragEl, "border", "2px solid gray");
    },
    endDrag: function(e) {
	this.logger.log(this.id + " endDrag");
        var srcEl = this.getEl();
        var proxy = this.getDragEl();

        // Show the proxy element and animate it to the src element's location
        Dom.setStyle(proxy, "visibility", "");
        var a = new YAHOO.util.Motion( 
            proxy, { 
                points: { 
                    to: Dom.getXY(srcEl)
                }
            }, 
            0.2, 
            YAHOO.util.Easing.easeOut 
        )
        var proxyid = proxy.id;
        var thisid = this.id;

        // Hide the proxy and show the source element when finished with the animation
        a.onComplete.subscribe(function() {
                Dom.setStyle(proxyid, "visibility", "hidden");
                Dom.setStyle(thisid, "visibility", "");
            });
        a.animate();
        YAHOO.example.DDApp.saveOrder();
    },
    onDragDrop: function(e, id) {
	this.logger.log(this.id + " dragDrop");
        // If there is one drop interaction, the tr was dropped either on the table,
        // or it was dropped on the current location of the source element.
        if (DDM.interactionInfo.drop.length === 1) {

            // The position of the cursor at the time of the drop (YAHOO.util.Point)
            var pt = DDM.interactionInfo.point; 

            // The region occupied by the source element at the time of the drop
            var region = DDM.interactionInfo.sourceRegion; 

            // Check to see if we are over the source element's location.  We will
            // append to the bottom of the list once we are sure it was a drop in
            // the negative space (the area of the table without any items)
            if (!region.intersect(pt)) {
                var destEl = Dom.get(id);
                var destDD = DDM.getDDById(id);
                destEl.appendChild(this.getEl());
                destDD.isEmpty = false;
                DDM.refreshCache();
            }

        }
    },

    onDrag: function(e) {

        // Keep track of the direction of the drag for use during onDragOver
        var y = Event.getPageY(e);

        if (y < this.lastY) {
            this.goingUp = true;
        } else if (y > this.lastY) {
            this.goingUp = false;
        }

        this.lastY = y;
    },
    onDragOver: function(e, id) {    
        var srcEl = this.getEl();
        var destEl = Dom.get(id);
        // We are only concerned with tr items, we ignore the dragover
        // notifications for the table.
        if (destEl.nodeName.toLowerCase() == "tr") {
            var orig_p = srcEl.parentNode;
            var p = destEl.parentNode;
            if (this.goingUp) {
                p.insertBefore(srcEl, destEl); // insert above
            } else {
                p.insertBefore(srcEl, destEl.nextSibling); // insert below
            }
            DDM.refreshCache();
        }
    }
});
YAHOO.example.DDApp.init();
}
