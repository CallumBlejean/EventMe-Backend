const {
    fetchAllEvents,
    fetchEventById,
    insertEvent,
    deleteEventById,
    fetchEventMembers,
    addEventMember,
    removeEventMember,
    checkIfMemberExists,
    fetchUserStatusById,
    fetchEventsByUserId,
  } = require("../models/events.model");
  
  exports.getAllEvents = (req, res, next) => {
    fetchAllEvents()
      .then((events) => res.status(200).send({ events }))
      .catch(next);
  };
  
  exports.getEventById = (req, res, next) => {
    const { event_id } = req.params;
    fetchEventById(event_id)
      .then((event) => res.status(200).send({ event }))
      .catch(next);
  };
  
  exports.createEvent = (req, res, next) => {
    const { title, description, date, location } = req.body;
    const created_by = req.user.user_id;

    console.log("👤 Creating event as user_id:", created_by);
    
    insertEvent(title, description, date, location, created_by)
      .then((event) => res.status(201).send({ event }))
      .catch(next);
  };
  
  exports.deleteEvent = (req, res, next) => {
    const { event_id } = req.params;
    deleteEventById(event_id)
      .then(() => res.status(204).send())
      .catch(next);
  };
  
  exports.getEventMembers = (req, res, next) => {
    const { event_id } = req.params;
    fetchEventMembers(event_id)
      .then((members) => res.status(200).send({ members }))
      .catch(next);
  };
  
  
  exports.removeMember = (req, res, next) => {
    const { event_id, user_id } = req.params;
  
    fetchUserStatusById(user_id)
      .then((user_status) => {
        if (!user_status) {
          return Promise.reject({ status: 404, msg: "Member not found in event" });
        }
  
        // Allow self-removal
        if (String(req.user.user_id) !== String(user_id)) {
          if (user_status === "admin" && req.user.user_status !== "admin") {
            return Promise.reject({ status: 403, msg: "Cannot remove an admin" });
          }
          if (req.user.user_status !== "admin" && req.user.user_status !== "staff") {
            return Promise.reject({ status: 403, msg: "Only admin/staff can remove other users" });
          }
        }
  
        return removeEventMember(user_id, event_id);
      })
      .then(() => res.status(204).send())
      .catch(next);
  };
  
  exports.joinEvent = (req, res, next) => {
    const event_id = req.params.event_id;
    const user_id = req.user.user_id;
  
    checkIfMemberExists(user_id, event_id)
      .then((isMember) => {
        if (isMember) {
          return Promise.reject({ status: 409, msg: "Already a member" });
        }
        return addEventMember(user_id, event_id);
      })
      .then(() => res.status(201).send({ msg: "Joined event successfully" }))
      .catch(next);
  };
  
  exports.getEventsByUserId = (req, res, next) => {
    const { user_id } = req.params;
  
    fetchEventsByUserId(user_id)
      .then((events) => {
        res.status(200).send({ events });
      })
      .catch(next);
  };
  