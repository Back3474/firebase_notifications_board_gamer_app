const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { ref } = require("firebase-functions/v1/database");
admin.initializeApp();

var db = functions.database;
var database = admin.database();


exports.meetingChanges = functions.database.ref("notification/changes").onUpdate(
    (change, context) => {
        var refNextMeeting = database.ref("next meeting");
        refNextMeeting.child("hostId").once("value", (snapshot) => {
            var uid = snapshot.val();
            refNextMeeting.child("host").once("value", (snapshot) => {
                var uName = snapshot.val();
                admin.messaging().sendToTopic(
                    "next_meeting",
                    {
                        data: {
                            uid: uid,
                            uName: uName,
                            msgId: "next_meeting",
                            title: "notification_next_meeting_detail_changes_title",
                            body: "notification_next_meeting_detail_changes"
                        }
                    }
                )
                
            })
        })
    }
);

exports.meeting_changes = db.ref("notification/changes").onCreate(
    (snapshot, context) => {
        var refNextMeeting = database.ref("next meeting");
        refNextMeeting.child("hostId").once("value", (snapshot) => {
            var uid = snapshot.val();
            refNextMeeting.child("host").once("value", (snapshot) => {
                var uName = snapshot.val();
                admin.messaging().sendToTopic(
                    "next_meeting",
                    {
                        data: {
                            uid: uid,
                            uName: uName,
                            msgId: "next_meeting",
                            title: "notification_next_meeting_detail_changes_title",
                            body: "notification_next_meeting_detail_changes"
                        }
                    }
                )
            })
        })
    }
)

exports.notificationNewRating = db.ref("last gamenight/ratings/{uid}").onCreate(
    (snapshot, context) => {
        const uid = context.params.uid;
        var refUser = database.ref("users/" + uid.toString() + "/firstname");
        refUser.on("value", (snapshot) => {
            var fName = snapshot.val();
            refUser.parent.child("lastname").on("value", (snapshot) => {
                var lName = snapshot.val();
                var uName = fName + " " + lName;
                admin.messaging().sendToTopic(
                    "new_rating",
                    {
                        data: {
                            uid: uid,
                            uName: uName,
                            msgId: "rating",
                            title: "notification_new_rating_title",
                            body: "notification_new_rating"
                        }
                    }
                )
            })
            
        });
    }
);

exports.notificationRatingChanged = functions.database.ref("last gamenight/ratings/{uid}").onUpdate(
    (change, context) => {
        const uid = context.params.uid;
        var refUser = database.ref("users/" + uid.toString() + "/firstname");
        refUser.on("value", (snapshot) => {
            var fName = snapshot.val();
            refUser.parent.child("lastname").on("value", (snapshot) => {
                var lName = snapshot.val();
                var uName = fName + " " + lName;
                admin.messaging().sendToTopic(
                    "rating_changed",
                    {
                        data: {
                            uid: uid,
                            uName: uName,
                            msgId: "rating",
                            title: "notification_changed_rating_title",
                            body: "notification_changed_rating"
                        }
                    }
                )
            })
            
        });
        
    }
);

exports.notificationNotTakingPart = db.ref("next meeting/participants/{uid}/isTakingPart").onUpdate(
    (change, context) => {
        const isTakingPart = change.after.val();
        const uid = context.params.uid;
        var refUser = database.ref("users/" + uid.toString() + "/firstname");
        refUser.on("value", (snapshot) => {
            var fName = snapshot.val();
            refUser.parent.child("lastname").on("value", (snapshot) => {
                var lName = snapshot.val();
                var uName = fName + " " + lName;
                if(isTakingPart == false){
                    admin.messaging().sendToTopic(
                        "not_taking_part",
                        {
                            data: {
                                uid: uid,
                                uName: uName,
                                msgId: "next_meeting",
                                title: "notification_not_taking_part_title",
                                body: "notification_not_taking_part"
                            }
                        }
                    )
                }
            })
            
        });
    }
);

exports.notificationLate = db.ref("next meeting/participants/{uid}/latetime").onWrite(
    (change, context) => {
        const latetime = change.after.val();
        const uid = context.params.uid;
        var refUser = database.ref("users/" + uid.toString() + "/firstname");
        refUser.on("value", (snapshot) => {
            var fName = snapshot.val();
            refUser.parent.child("lastname").on("value", (snapshot) => {
                var lName = snapshot.val();
                var uName = fName + " " + lName;
                if(latetime != 0){
                    const latetimeString = latetime.toString();
                    admin.messaging().sendToTopic(
                        "late_participant",
                        {
                            data: {
                                uid: uid,
                                uName: uName,
                                msgId: "next_meeting",
                                title: "notification_late_participant_title",
                                body: "notification_late_participant",
                                latetime: latetimeString
                            }
                        }
                    )
                }
            })
        });
    }
);

exports.notificationNewGame = db.ref("next meeting/games/{game}").onCreate(
    (snapshot, context) => {
        const game = context.params.game;
        var refRecommender = database.ref("next meeting/games/" + game.toString() + "/recommender");
        refRecommender.on("value", (snapshot) => {
            var uid = snapshot.val();
            var refUser = database.ref("users/" + uid.toString() + "/firstname");
            refUser.on("value", (snapshot) => {
                var fName = snapshot.val();
                refUser.parent.child("lastname").on("value", (snapshot) => {
                    var lName = snapshot.val();
                    var uName = fName + " " + lName;
                    admin.messaging().sendToTopic(
                        "new_game",
                        {
                            data: {
                                uid: uid,
                                uName: uName,
                                msgId: "games",
                                title: "notification_new_game_title",
                                body: "notification_new_game",
                                game: game
                            }
                        }
                    )
                })
            })
        }) 
    }
)

exports.notificationMeetingCanceled = db.ref("notification/isCanceled").onCreate(
    (snapshot, context) => {
        var refHost = database.ref("next meeting/host");
        refHost.once("value", (snapshot) => {
            var uName = snapshot.val();
            var refHostId = database.ref("next meeting/hostId");
            refHostId.once("value", (snapshot) => {
                var uid = snapshot.val();
                admin.messaging().sendToTopic(
                    "meeting_canceled",
                    {
                        data: {
                            uid: uid,
                            uName: uName,
                            msgId: "next_meeting",
                            title: "notification_meeting_canceled_title",
                            body: "notification_meeting_canceled"
                        }
                    }
                )  
            })
        })        
    }
)

exports.notificationNewMeeting = db.ref("notification").onDelete(
    (snapshot, context) => {
        var refHost = database.ref("next meeting/host");
        refHost.once("value", (snapshot) => {
            var uName = snapshot.val();
            var refHostId = database.ref("next meeting/hostId");
            refHostId.once("value", (snapshot) => {
                var uid = snapshot.val();
                admin.messaging().sendToTopic(
                    "next_meeting",
                    {
                        data: {
                            uid: uid,
                            uName: uName,
                            msgId: "new_meeting",
                            title: "notification_new_meeting_generated_title",
                            body: "notification_new_meeting_generated"
                        }
                    }
                )  
            })
        })
    }
)