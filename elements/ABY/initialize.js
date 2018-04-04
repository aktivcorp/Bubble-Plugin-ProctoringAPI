function(instance, context) {  	
    instance.data.widthrptl = instance.canvas[0].offsetWidth;

    instance.data.rptl = $('<div id="replay_timeline"></div>');
    instance.data.rptl.width(instance.data.widthrptl + 'px');
    instance.data.rptl.height('50px');
    instance.canvas.append(instance.data.rptl);
}