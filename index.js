var uuid=require("uuid");
var staticDrivers={
    eos:require("./driver/eos.js")
}
module.exports = class socialnetworkIndex
{
	constructor(config,dist)
	{
		this.config=config.statics
		this.context=this.config.context 
        this.bootstrap=require('./bootstrap.js')
        this.enums=require('./struct.js') 
        this.tempConfig=require('./config.js')
        this.drivers={}
        if(this.config.drivers)
            for(var a of this.config.drivers)
            {
                this.drivers[a.name]=new staticDrivers[a.type](a)
            }
	}
	async getFollower(msg,func,self)
    {
		var dt=msg.data;
        if(dt.name && self.drivers[dt.name])
        {
            return self.drivers[dt.name].getFollower(msg,func,self.drivers[dt.name])
        }
		return func(null,data);
    }
	async getFollowing(msg,func,self)
    {
		var dt=msg.data;
        if(dt.name && self.drivers[dt.name])
        {
            return self.drivers[dt.name].getFollower(msg,func,self.drivers[dt.name])
        }
		return func(null,data);
    }
	async follow(msg,func,self)
	{
		var dt=msg.data;
        if(dt.name && self.drivers[dt.name])
        {
            return self.drivers[dt.name].follow(msg,func,self.drivers[dt.name])
        }
		return func(null,data);
	}
	async unfollow(msg,func,self)
	{
		var dt=msg.data;
        if(dt.name && self.drivers[dt.name])
        {
            return self.drivers[dt.name].unfollow(msg,func,self.drivers[dt.name])
        }
		return func(null,data);
	}
}