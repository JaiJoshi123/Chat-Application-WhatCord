let user = {}
let room = {}

module.exports.storeInfo = ((usr,roomObj)=>{
    user = { ...usr };
    room = {...roomObj};
    //console.log(usr)
})

module.exports.getInfo = ()=>{
    return {user,room};
}