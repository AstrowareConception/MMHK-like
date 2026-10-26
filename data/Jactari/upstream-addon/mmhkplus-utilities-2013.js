MMHKPLUS.exportToImage = function($selector) {
	var htmlContent = "";
	htmlContent +="<html><head>";
	htmlContent += '<meta http-equiv="content-type" content="text/html; charset=utf-8" />';
	htmlContent += "<style type='text/css'>.battleResultDetailedMessageModelCompleteDetailedViewZone { width:600px; } body {background-color:white;}</style>";
	$("head > link[rel='stylesheet']").each(function(i, elem)
		{
			htmlContent += elem.outerHTML;
		}
	);
	htmlContent += "</head><body>";
	htmlContent += $selector[0].outerHTML;
	htmlContent += "</body></html>";
	
	MMHKPLUS.getElement("Ajax").exportToImage(htmlContent, function(json) { MMHKPLUS.openURL(json.url)});
};

MMHKPLUS.clearInterval = function(interval) {
	if(interval)
	{
		clearInterval(interval);
		interval = null;
	}
};

MMHKPLUS.resetElement = function($element) {
	$element.remove().removeAttr("style").removeClass().off().empty();
};

MMHKPLUS.addElement = function(element) {
	MMHKPLUS.elementPool[element.elementType] = element;
};

MMHKPLUS.getElement = function(type, createIfNull) {
	var elem = MMHKPLUS.elementPool[type] || null;
	if(!elem && isDefined(createIfNull) && createIfNull && hasProperty(MMHKPLUS, type))
	{
		MMHKPLUS.addElement(Object.create(MMHKPLUS[type]).init());
		elem = MMHKPLUS.elementPool[type] || null;
	}
	return elem;
};

MMHKPLUS.removeElement = function(type) {
	if(hasProperty(MMHKPLUS.elementPool, type))
	{
		MMHKPLUS.elementPool[type].unload();
		delete MMHKPLUS.elementPool[type];
	}
};

MMHKPLUS.openDisplayable = function(type) {
	if(!hasProperty(MMHKPLUS, type))
	{
		console.log("Error", "Element <b>" + type + "</b> not found!"); // for sure, this element has been removed or renamed.
		return;
	}
	var element = MMHKPLUS.getElement(type);
	if(!element)
	{
		MMHKPLUS.addElement(Object.create(MMHKPLUS[type]).init());
	}
	MMHKPLUS.getElement(type).display();
};

MMHKPLUS.openHiddenDisplayable = function(type) {
    var $sel = $("ul.MMHKPLUS_SubMenu > li:contains('" + type + "')");
    $sel[0].click();
};

MMHKPLUS.alert = function(title, message) {
    $("<div>")
        .attr({title: title, "class": "MMHKPLUS_alert"})
        .html(message)
        .dialog(
			{
				buttons: {OK: function(){$(this).dialog('close');}},
				close: function(){$(this).remove();},
				draggable: false,
				modal: true,
				resizable: false,
				width: "auto", height : "auto",
				zIndex : 1000000
			}
		);
};

MMHKPLUS.dialog = function(title, message, onOk, onCancel) {
	$("<div>")
    .attr({title: title, "class": "MMHKPLUS_dialog"})
    .addClass("MMHKPLUS_TextCenter")
    .html(message)
    .dialog(
    	{
    		draggable: false,
			modal: true,
			resizable: false,
			width: "auto", height : "auto",
			zIndex : 1000000,
			close: function(){$(this).remove();},
		    buttons: {
		        "Ok": function() {
		            onOk();
		        },
		        "Cancel": function() {
		            onCancel();
		        }
		    }
    	}
    );
};



MMHKPLUS.getCssSprite = function (l, c) {
	var d = $("<div>");
    try {
		var d = $("<div>");
        var css = MMHKPLUS.HOMMK.CSSSPRITE_CONF[l];
        var k = css.sprites[c];
        var x = k.x;
        var y = k.y;
        var h = (hasProperty(css, "eventFile") && css.eventFile && hasProperty(MMHKPLUS.HOMMK, "EVENT_IMG_URL") ? MMHKPLUS.HOMMK.EVENT_IMG_URL : MMHKPLUS.HOMMK.IMG_URL) 
					+ "css_sprite/" + (hasProperty(css, "file") ? css.file : l) + "." + css.ext;
        if (x == 0 && y == 0) 
		{
            x = css.width;
            y = css.height;
        }
		d.css(
			{
				"background-image": "url('" + h + "')",
				"background-position": "-" + x + "px -" + y + "px",
				"background-repeat": "repeat",
				"width": k.w + "px",
				"height": k.h + "px"
			}
		);
    } catch (g) {
		console.log("Error : ", g);
		console.log("spriteConf : ", l);
		console.log("spriteType : ", c);
        console.trace();
    }
	return d;
};

MMHKPLUS.getPlayerAvatar = function(backgroundId, patternId, iconId) {
	var $image = $("<div/>").css( { width : "40px", height : "40px" } );
	$image
		.append(
			MMHKPLUS.getCssSprite("playerIconBackground", "BACKGROUND" + backgroundId));
			
	$image
		.append(
			MMHKPLUS.getCssSprite("playerIconPattern", "PATTERN" + patternId)
				.css({position : "relative", top : "-40px", left : "0px"}));
	
	$image
		.append(
			MMHKPLUS.getCssSprite("playerIcon", "ICON" + iconId)
				.css({position : "relative", top : "-80px", left : "0px"}));

	return $image;
}

MMHKPLUS.openPlayerFrame = function(id) {
	MMHKPLUS.HOMMK.openPlayerProfileFrame(id);
};

MMHKPLUS.centerOn = function(x, y) {
	if(isNaN(x) || isNaN(y) || x < 0 || y < 0 || x > MMHKPLUS.getElement("Player").get("worldSize") || y > MMHKPLUS.getElement("Player").get("worldSize"))
	{
		return;
	}
	if(MMHKPLUS.HOMMK.currentView.viewType >= 3)
	{
		MMHKPLUS.HOMMK.setCurrentView(MMHKPLUS.HOMMK.REGION_WORLDMAP_ZOOM_13X13);
	}
	MMHKPLUS.wait(function() 
		{
			return MMHKPLUS.HOMMK.runningJsonRequestCount == 0 && !MMHKPLUS.HOMMK.currentView.isLoading;
		},
		function()
		{
			MMHKPLUS.HOMMK.worldMap.center(parseInt(x), parseInt(y));
		}
	);
};

MMHKPLUS.distance = function(x1, y1, x2, y2) {
	var dx = Math.abs(x2 - x1) || 0; 
	var dy = Math.abs(y2 - y1) || 0;
	var s = MMHKPLUS.getElement("Player").get("worldSize");
	if (dx > s / 2) 
	{
		dx = s - dx;
	}
	if (dy > s / 2) 
	{
		dy = s - dy;
	}
	return Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
};

MMHKPLUS.getRegionId = function(x, y) {
	return (parseInt(y) - 1) * MMHKPLUS.getElement("Player").get("worldSize") + parseInt(x);
};

MMHKPLUS.openURL = function(url) {
	window.open(url, "_blank");
};

MMHKPLUS.wait = function(exec, callback, count) {
	if(exec() || count == 0)
	{
		callback();
	}
	else
	{
		if(!count) count = 30;
		if(count > 0)
		{
			setTimeout(MMHKPLUS.wait, 200, exec, callback, count - 1);
		}
	}
};

MMHKPLUS.worldSizeMod = function(a) {
    var s = MMHKPLUS.getElement("Player").get("worldSize");
    return ((s + a -1 ) % s) + 1;
};
        
MMHKPLUS.worldRange = function(a, b) {
    var result = [];
    var dep = a;
    while(MMHKPLUS.worldSizeMod(dep) != b)
    {
        result.push(MMHKPLUS.worldSizeMod(dep));
        dep++;
    }
    result.push(b);
    return result;
};

MMHKPLUS.previousCurrentViewX = -1;
MMHKPLUS.previousCurrentViewY = -1;
MMHKPLUS.previousCurrentView = [];
MMHKPLUS.currentView = function() {
    var player = MMHKPLUS.getElement("Player");
    var x = player.getCurrentViewX();
    var y = player.getCurrentViewY();

    if(x == MMHKPLUS.previousCurrentViewX && y == MMHKPLUS.previousCurrentViewY)
    {
        return MMHKPLUS.previousCurrentView;
    }
    MMHKPLUS.previousCurrentViewX = x;
    MMHKPLUS.previousCurrentViewY = y;

    var result = [];
    
    MMHKPLUS.worldRange(MMHKPLUS.worldSizeMod(x - 6), MMHKPLUS.worldSizeMod(x + 6)).forEach(function(xx)
        {
            MMHKPLUS.worldRange(MMHKPLUS.worldSizeMod(y - 3), MMHKPLUS.worldSizeMod(y + 3)).forEach(function(yy)
                {
                    result.push(xx + "_" + yy);
                }
            );
        }
    );
    MMHKPLUS.worldRange(MMHKPLUS.worldSizeMod(x - 5), MMHKPLUS.worldSizeMod(x + 6)).forEach(function(xx)
        {
            result.push(xx + "_" + MMHKPLUS.worldSizeMod(y - 4));
        }
    );
    MMHKPLUS.worldRange(MMHKPLUS.worldSizeMod(x - 4), MMHKPLUS.worldSizeMod(x + 5)).forEach(function(xx)
        {
            result.push(xx + "_" + MMHKPLUS.worldSizeMod(y - 5));
        }
    );
    MMHKPLUS.worldRange(MMHKPLUS.worldSizeMod(x - 3), MMHKPLUS.worldSizeMod(x + 4)).forEach(function(xx)
        {
            result.push(xx + "_" + MMHKPLUS.worldSizeMod(y - 6));
        }
    );
    MMHKPLUS.worldRange(MMHKPLUS.worldSizeMod(x - 6), MMHKPLUS.worldSizeMod(x + 5)).forEach(function(xx)
        {
            result.push(xx + "_" + MMHKPLUS.worldSizeMod(y + 4));
        }
    );
    MMHKPLUS.worldRange(MMHKPLUS.worldSizeMod(x - 5), MMHKPLUS.worldSizeMod(x + 4)).forEach(function(xx)
        {
            result.push(xx + "_" + MMHKPLUS.worldSizeMod(y + 5));
        }
    );
    MMHKPLUS.worldRange(MMHKPLUS.worldSizeMod(x - 4), MMHKPLUS.worldSizeMod(x + 3)).forEach(function(xx)
        {
            result.push(xx + "_" + MMHKPLUS.worldSizeMod(y + 6));
        }
    );
    
    MMHKPLUS.previousCurrentView = result;
    
    return result;
};

MMHKPLUS.hoursToCountdown = function(hours) {
	var d = new Date();
	d.setTime(hours * 3600 * 1000);
	return d.countDown();
};

MMHKPLUS.localize = function(id) {
    if(hasProperty(MMHKPLUS.translations, id))
	   return MMHKPLUS.translations[id][MMHKPLUS.locale] || "NotFound_" + id;
    else
        return "NotFound_" + id;
};

MMHKPLUS.localizeUnit = function(faction, tier) {
    if(hasProperty(MMHKPLUS.translationsUnits, faction) 
        && hasProperty(MMHKPLUS.translationsUnits[faction], tier))
        return MMHKPLUS.translationsUnits[faction][tier][MMHKPLUS.locale] || "NotFound_" + faction + "_" + tier;
    else
        return "NotFound_" + faction + "_" + tier;
};

MMHKPLUS.localizeText = function(text) {
    var languages = ["fr", "en", "ru"];
    var result = "NotFound_(" + text + ")";
    MMHKPLUS.translationsText.forEach(function(t)
        {
            languages.forEach(function(l)
                {
                    if(removeDiacritics(t[l]).replace(/[ ,‚'"]/g, "").toUpperCase().trim() == removeDiacritics(text).replace(/[ ,‚'"]/g, "").trim().toUpperCase())
                        result = t[MMHKPLUS.locale];
                }
            );
        }
    );
    return result;
};

MMHKPLUS.checkUpdate = function() {
	$.getJSON(MMHKPLUS.URL_API + "version", function(json)
        {
            var local = MMHKPLUS.version.split(".");
            
            var LNV_Major = parseInt(local[0]);
            var LNV_Minor = parseInt(local[1]);
            var LNV_Patch = parseInt(local[2] || 0);
            
            var need = (LNV_Major < json.major) || ((LNV_Major == json.major) && (LNV_Minor < json.minor)) || ((LNV_Major == json.major) && (LNV_Minor == json.minor) && (LNV_Patch < json.patch));
            if(need)
            {
                panel = $("<div/>");
                $("<p style='width:100%'/>").addClass("center").html("MMHK-Plus").appendTo(panel);
                $("<br/>").appendTo(panel);
                $("<p style='width:100%'/>").addClass("center").html(MMHKPLUS.localize("UPDATE_TEXT")).appendTo(panel);
                $("<br/>").appendTo(panel);
                $("<p><a class='MMHKPLUS_Link' href='" + MMHKPLUS.URL + "' target='_blank' style='font-size:140%;'>" + MMHKPLUS.localize("SITE") + "</a></p>").addClass("center").appendTo(panel);
                $("<p><a class='MMHKPLUS_Link' href='" + MMHKPLUS.URL + "/script/download.php?.user.js" + "' target='_blank' style='font-size:140%;'>" + MMHKPLUS.localize("DOWNLOAD") + "</a></p>").addClass("center").appendTo(panel);
                panel.dialog(
                    {
                        autoOpen : false,
                        title : MMHKPLUS.localize("UPDATE_TITLE"),
                        zIndex : 90000,
                        resizable : false,
                        width : 370,
                        height : 190,
                        position : ["center", "center"]
                    }
                );
                
                panel.dialog("open");
            }
        }
    );
};

MMHKPLUS.init = function() {
	window.MMHKPLUS = MMHKPLUS;
	MMHKPLUS.locale = (MMHKPLUS.HOMMK.getLanguage() == "fr" ? "fr" : (MMHKPLUS.HOMMK.getLanguage() == "ru" ? "ru" : "en")) || "en";
	$("<style/>").attr("type", "text/css").html(MMHKPLUS.css.join("")).appendTo($("head"));
	
	MMHKPLUS.addElement(Object.create(MMHKPLUS.Store).init());
	MMHKPLUS.addElement(Object.create(MMHKPLUS.Ajax).init());
	MMHKPLUS.addElement(Object.create(MMHKPLUS.Player).init());
	MMHKPLUS.addElement(Object.create(MMHKPLUS.Menu).init());
    MMHKPLUS.addElement(Object.create(MMHKPLUS.WorldSwitch).init());
	MMHKPLUS.addElement(Object.create(MMHKPLUS.Jactari).init());
    //MMHKPLUS.addElement(Object.create(MMHKPLUS.EnhancedUI).init());   // is called by Ajax during is init
    MMHKPLUS.addElement(Object.create(MMHKPLUS.Cartographer).init());
    MMHKPLUS.addElement(Object.create(MMHKPLUS.MineFinder).init());
	
	var preferences = MMHKPLUS.getElement("Store").get("MMHKPLUS_PREFERENCES");
	for(var i in preferences)
	{
		if(hasProperty(preferences[i], "o") && preferences[i].o)
		{
            if(i != "Chat" || (i == "Chat" && MMHKPLUS.getElement("EnhancedUI").options.chatType == 2))
			    MMHKPLUS.openDisplayable(i);
		}
	}

    MMHKPLUS.checkUpdate();

    MMHKPLUS.HOMMK.JsonRequestHandler.prototype.onOKResponse = injectAfter(MMHKPLUS.HOMMK.JsonRequestHandler.prototype.onOKResponse, function(a, b, c) { console.log(arguments);});
    
    // When init is complete, enhance UI
    MMHKPLUS.getElement("EnhancedUI").enhanceUi();
};

MMHKPLUS.unload = function() {
	for(var i in MMHKPLUS.elementPool)
	{
		MMHKPLUS.elementPool[i].unload();
	}
};
