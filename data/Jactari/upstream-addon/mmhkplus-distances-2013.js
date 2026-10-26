MMHKPLUS.Distances = MMHKPLUS.PanelElement.extend({
	elementType : "Distances",
	intervalRefresh : null,
	lastPosX : -1,
	lastPosY : -1,
	
	options : {
		title : "",
		resizable : true,
		opened : false,
		x : "center",
		y : "center",
		w : 300,
		h : 300,
		savePos : true,
		saveWidth : false,
		saveHeight : true,
		saveOpened : true,
		refresh : 1000,
		images : MMHKPLUS.URL_IMAGES + "side/"
	},
	
	init : function(options)
	{
		this.options = $.extend({}, this.options, options);
		this.options.title = MMHKPLUS.localize("DISTANCES");
		this.$elem = $("<div>");

		this._setupPanel();
		
		return this;
	},
	
	onSetup : function()
	{
		var self = this;
		this.$elem.dialog(
			{
				minWidth : self.options.w,
				maxWidth: self.options.w
			}
		);
	},
	
	onOpen : function()
	{
		this.intervalRefresh = setInterval((function(self) { return function() { self._createView(); } })(this), this.options.refresh);
		this._createView();
	},
	
	onClose : function()
	{
		MMHKPLUS.clearInterval(this.intervalRefresh);
		this.intervalRefresh = null;
        this.lastPosX = -1;
        this.lastPosY = -1;
	},
	
	_createView : function()
	{
		var self = this;
		var player = MMHKPLUS.getElement("Player");
		var currentX = player.getCurrentViewX();
		var currentY = player.getCurrentViewY();
		
		if(this.lastPosX != currentX || this.lastPosY != currentY)
		{
			this.lastPosX = currentX;
			this.lastPosY = currentY;
			
			this.$elem.empty();
			var $table = $("<table>")
				.addClass("MMHKPLUS_Table MMHKPLUS_100Width MMHKPLUS_WhiteBorder MMHKPLUS_TextCenter")
				.css({borderCollapse : "collapse"})
				.appendTo(this.$elem);
			$("<tr>\
				<td class='MMHKPLUS_Cell MMHKPLUS_WhiteBorder' style='padding:3px;width:120px;'><b>" + MMHKPLUS.localize("CITY") + "</b></td>\
				<td class='MMHKPLUS_Cell MMHKPLUS_WhiteBorder' style='padding:3px;font-size:80%'>" + MMHKPLUS.localize("SQUARES") + "</td>\
				<td class='MMHKPLUS_Cell MMHKPLUS_WhiteBorder' style='padding:3px;'><img style='width:20px;height:20px' src='" + self.options.images + "hero.png'/></td>\
				<td class='MMHKPLUS_Cell MMHKPLUS_WhiteBorder' style='padding:3px;'><img style='width:20px;height:20px' src='" + self.options.images + "army.png'/></td>\
				<td class='MMHKPLUS_Cell MMHKPLUS_WhiteBorder' style='padding:3px;'><img style='width:20px;height:20px' src='" + self.options.images + "caravan.png'/></td>\
			</tr>").appendTo($table);
			
			var cities = player.getCities();
			cities.forEach(function(city)
				{
					var $line = $("<tr/>").appendTo($table);
					
					var dist = MMHKPLUS.distance(city.content.x, city.content.y, currentX, currentY);
					
					$("<td style='padding:3px;'>")
						.addClass("MMHKPLUS_Cell MMHKPLUS_WhiteBorder")
						.css({cursor : "pointer"})
						.html("<b>" + city.content.cityName + "</b>")
						.click(function()
							{
								MMHKPLUS.centerOn(city.content.x, city.content.y);
							})
						.appendTo($line);
					
					$("<td style='width:15px;padding:3px;'/>")
						.addClass("MMHKPLUS_Cell MMHKPLUS_WhiteBorder")
						.html(parseInt(dist))
						.appendTo($line);
						
					$("<td style='width:15px;padding:3px;'/>")
						.addClass("MMHKPLUS_Cell MMHKPLUS_WhiteBorder")
						.html("...")
						.mouseenter(function(e)
							{
								$(this).css({"width" : "80px;", "font-size" : "90%"});
								$(this).html(MMHKPLUS.hoursToCountdown(dist/12));
							})
						.mouseleave(function(e)
							{
								$(this).css({"width" : "15px;", "font-size" : "90%"});
								$(this).html("...");
							})
						.appendTo($line);
					
					$("<td style='width:15px;padding:3px;'/>")
						.addClass("MMHKPLUS_Cell MMHKPLUS_WhiteBorder")
						.html("...")
						.mouseenter(function(e)
							{
								$(this).css({"width" : "80px;", "font-size" : "90%"});
								$(this).html(MMHKPLUS.hoursToCountdown(dist/4));
							})
						.mouseleave(function(e)
							{
								$(this).css({"width" : "15px;", "font-size" : "90%"});
								$(this).html("...");
							})
						.appendTo($line);
					
					$("<td style='width:15px;padding:3px;'/>")
						.addClass("MMHKPLUS_Cell MMHKPLUS_WhiteBorder")
						.html("...")
						.mouseenter(function(e)
							{
								$(this).css({"width" : "80px;", "font-size" : "90%"});
								$(this).html(MMHKPLUS.hoursToCountdown(dist/9.375));
							})
						.mouseleave(function(e)
							{
								$(this).css({"width" : "15px;", "font-size" : "90%"});
								$(this).html("...");
							})
						.appendTo($line);
				}
			);
		}
	},
	
	unload : function()
	{
		MMHKPLUS.clearInterval(this.intervalRefresh);
		this.intervalRefresh = null;
		MMHKPLUS.resetElement(this.$elem);
	}
});
