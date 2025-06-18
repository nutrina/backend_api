

process.on("unhandledRejection", (error) => {
    // TODO: proper handling of this should be added, like 
    // triggering an alarm with a monitoring service
    // The current implmentation will prevent the server from crashing, 
    // but the request will hang (at least for a while)
    // In the ideal case this would never be called
    console.log("************************************")
    console.log(error);
    console.log("************************************")
})

process.on("uncaughtException", (error) => {
    // TODO: proper handling of this should be added, like 
    // triggering an alarm with a monitoring service
    // The current implmentation will prevent the server from crashing, 
    // but the request will hang (at least for a while)
    // In the ideal case this would never be called
    console.log("************************************")
    console.log(error);
    console.log("************************************")
})