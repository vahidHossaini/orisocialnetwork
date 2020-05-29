const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util'); 
let {PrivateKey, PublicKey, Signature, Aes, key_utils, config} = require('eosjs-ecc')
var crypto = require('crypto');
var uuid=require('uuid');
const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;
module.exports = class eosSocialnetwork
{
	constructor(config)
	{
        this.config=config;
        this.context=config.context;	
        this.rpc = new JsonRpc(config.nodeAddress,{ fetch });		
        const client = new HyperionSocketClient(config.socketNodeAddress, {async: false});
        client.onData=this.reciveData;
        client.onConnect = async() => {
          var date=global.db.SearchOne(self.context,'socialnetwork_option',{_id:1})  
          if(!date)
          {
              date='2020-03-15T00:00:00.000Z'
          }
          else
          {
              date=date.date;
          }
          client.streamActions({
            contract: 'admin.areax',
            action: 'follow',
            account: '',
            start_from: '2020-03-15T00:00:00.000Z',
            read_until: 0,
            filters: [],
          });
          client.streamActions({
            contract: 'admin.areax',
            action: 'unfollow',
            account: '',
            start_from: '2020-03-15T00:00:00.000Z',
            read_until: 0,
            filters: [],
          });
          client.streamActions({
            contract: 'admin.areax',
            action: 'sendmessage',
            account: '',
            start_from: '2020-03-15T00:00:00.000Z',
            read_until: 0,
            filters: [],
          });
        }
	}
    async reciveData(data, ack)
    {
        
        if (data.type === 'action') {
            const act = data.content['act'];
            var lastTime= data.content['@timestamp'];
            if(content.table=='follow')
            { 
                //socialnetwork
                var exist= await global.db.SearchOne(self.context,'socialnetwork', {where:{followid:act.data['player'],userid:act.data['following']}});
                if(!exist)
                {
                    await global.db.Save(self.context,'socialnetwork',["_id"],{followid:act.data['player'],userid:act.data['following'],_id:content['block_num']} )
                }
            }
            if(content.table=='unfollow')
            {
                var exist= await global.db.SearchOne(self.context,'socialnetwork', {where:{followid:act.data['player'],userid:act.data['following']}});
                if(exist)
                {
                    await global.db.Delete(self.context,'socialnetwork',["_id"],{_id:content['block_num']} )
                }
                
            }
            if(content.table=='sendmessage')
            {
                
            }
            global.db.Save(self.context,'socialnetwork_option',["_id"],{_id:1,date:lastTime})
        }
        
    }
    async transacte(syntax,b)
    {
        var x = new JsSignatureProvider([b.owner.privateKey]); 
        var api = new Api({ rpc:self.rpc,signatureProvider: x, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
        try{
            var trdata = await api.transact(syntax, 
                {
                  blocksBehind: 3,
                  expireSeconds: 30,
                }
            );             
        }catch(exp){
            retun false
        }
        return true
    }
	async getFollower(msg,func,self)
    {
		var dt=msg.data;
		var data = await global.db.Search(self.context,'socialnetwork', {where:{followid:session.userid}},dt);
        retun func(null,data)
    }
	async getFollowing(msg,func,self)
    {
		var dt=msg.data;
		var data = await global.db.Search(self.context,'socialnetwork', {where:{userid:session.userid}},dt);
        retun func(null,data)
    }
	async follow(msg,func,self)
	{
		var dt=msg.data;
		var session=msg.session;
		var b = await global.db.SearchOne(self.context,'wallet_data', {where:{_id:session.userid}});
		if(!b)
            return func({m:"socialnetwork001"})
        var username=b.username
        var syntax = {
            "transaction":{
                "actions": [{
                  "account": "admin.areax",
                  "name": "follow",
                  "authorization": [{
                    "actor": username,
                    "permission": "owner"
                  }],
                  "data": {
                    "player": username,
                    "following":dt.username
                  }
                }]
            }
        }
        var data=self.transacte(syntax,b)
		return func(null,data);
	}
	async unfollow(msg,func,self)
	{
		var dt=msg.data;
		var session=msg.session;
		var b = await global.db.SearchOne(self.context,'wallet_data', {where:{_id:session.userid}});
		if(!b)
            return func({m:"socialnetwork001"})
        var username=b.username
        var syntax = {
            "transaction":{
                "actions": [{
                  "account": "admin.areax",
                  "name": "unfollow",
                  "authorization": [{
                    "actor": username,
                    "permission": "owner"
                  }],
                  "data": {
                    "player": username,
                    "following":dt.username
                  }
                }]
            }
        }
        var data=self.transacte(syntax,b)
		return func(null,data);
	}
}