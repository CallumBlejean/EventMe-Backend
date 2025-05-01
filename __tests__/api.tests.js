const request = require("supertest");
const app = require("../app"); 
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const endPoints = require("../endPoints.json");

jest.mock("../middleware/auth");
const getAppAsUser = (user_status = "active") => {
  jest.resetModules();
  jest.doMock("../middleware/auth", () => ({
    verifyToken: (req, res, next) => {
      req.user = { user_id: 1, user_status };
      next();
    },
    checkAdmin: (req, res, next) => {
      if (req.user.user_status === "admin") return next();
      return res.status(403).json({ msg: "Forbidden - Admin access required" });
    },
    checkStaff: (req, res, next) => {
      if (["admin", "staff"].includes(req.user.user_status)) return next();
      return res.status(403).json({ msg: "Forbidden - Staff access required" });
    }
  }));
  return require("../app");
};

const getAppAsAdmin = () => getAppAsUser("admin");
const getAppAsStaff = () => getAppAsUser("staff");

beforeEach(() => {
  return seed(data);
});
afterAll(() => {
  return db.end();
});

describe("API ", () => {
  describe("    GET /api", () => {
    it("200: responds with all available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(endPoints);
        });
    });
  });
  describe("    ERROR HANDLING", () => {
    it("404: responds with 404 for a non-existent endpoint", () => {
      return request(app)
        .get("/api/nonexistent")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404: Not Found");
        });
    });
  });
});

describe("API/USERS ", () => {
  describe("    GET /api/users", () => {
    it("200: responds with an array of user objects", () => {
      const mockAuth = require("../middleware/auth");
  mockAuth.verifyToken = (req, res, next) => {
    req.user = { user_id: 1, user_status: "admin" };
    next();
  };
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.users)).toBe(true);
          expect(body.users.length).toBeGreaterThan(0);
          body.users.forEach((user) => {
            expect(user).toHaveProperty("user_id", expect.any(Number));
            expect(user).toHaveProperty("firebase_uid", expect.any(String));
            expect(user).toHaveProperty("name", expect.any(String));
            expect(user).toHaveProperty("email", expect.any(String));
            expect(user).toHaveProperty(
              "user_status",
              expect.stringMatching(/^(active|admin|staff|banned)$/)
            );
          });
        });
    });
  });

  describe("    GET /api/users/:user_id", () => {
    it("200: responds with the correct user", () => {
      return request(app)
        .get("/api/users/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toHaveProperty("user_id", 1);
          expect(body.user).toHaveProperty("firebase_uid", expect.any(String));
          expect(body.user).toHaveProperty("name", expect.any(String));
          expect(body.user).toHaveProperty("email", expect.any(String));
          expect(body.user).toHaveProperty("user_status", expect.any(String));
        });
    });

    it("404: responds with 'User Not Found' for invalid user_id", () => {
      return request(app)
        .get("/api/users/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("User Not Found");
        });
    });
  });

  describe("    GET /api/users/email/:email", () => {
    it("200: responds with a user object with that email", () => {
      return request(app)
        .get("/api/users/email/callum@example.com")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toHaveProperty("user_id", expect.any(Number));
          expect(body.user).toHaveProperty("firebase_uid", expect.any(String));
          expect(body.user).toHaveProperty("name", expect.any(String));
          expect(body.user).toHaveProperty("email", "callum@example.com");
          expect(body.user).toHaveProperty("user_status", expect.any(String));
        });
    });

    it("404: responds with 'User Not Found' for invalid email", () => {
      return request(app)
        .get("/api/users/email/notarealemail@example.com")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("User Not Found");
        });
    });
  });

  describe("    POST /api/users", () => {
    it("201: successfully creates a user", () => {
      const newUser = {
        firebase_uid: "test-uid-123",
        name: "John Doe",
        email: "johndoe@example.com",
        user_status: "staff"
      };
      return request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body.user).toHaveProperty("user_id", expect.any(Number));
          expect(body.user).toHaveProperty("firebase_uid", newUser.firebase_uid);
          expect(body.user).toHaveProperty("name", newUser.name);
          expect(body.user).toHaveProperty("email", newUser.email);
          expect(body.user).toHaveProperty("user_status", "staff");
        });
    });
  });

  describe("    PATCH /api/users/:user_id", () => {
    it("200: successfully updates a user's name and user_status", () => {
      return request(app)
        .patch("/api/users/1")
        .send({
          name: "Updated Name",
          email: "updated@example.com",
          user_status: "admin"
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toHaveProperty("user_id", 1);
          expect(body.user).toHaveProperty("name", "Updated Name");
          expect(body.user).toHaveProperty("email", "updated@example.com");
          expect(body.user).toHaveProperty("user_status", "admin");
        });
    });

    it("400: responds with 'Bad Request' when provided invalid data types", () => {
      return request(app)
        .patch("/api/users/1")
        .send({
          name: 123,
          email: false,
          user_status: true
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request - Invalid Data");
        });
    });

    it("404: responds with 'User Not Found' for a non-existent user", () => {
      return request(app)
        .patch("/api/users/9999")
        .send({
          name: "Non Existent",
          email: "nonexistent@example.com",
          user_status: "banned"
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("User Not Found");
        });
    });
  });

  describe("    DELETE /api/users/:user_id", () => {
    it("204: successfully deletes a user by user ID", () => {
      return request(app).delete("/api/users/1").expect(204);
    });

    it("404: responds with 'User Not Found' for a non-existent user_id", () => {
      return request(app)
        .delete("/api/users/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("User not found");
        });
    });
  });

  describe("    PATCH /api/users/restrict/:user_id", () => {
    it("200: successfully bans a user", () => {
      return request(app)
        .patch("/api/users/restrict/2")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toHaveProperty("user_id", 2);
          expect(body.user).toHaveProperty("user_status", "banned");
        });
    });

    it("404: responds with 'User Not Found' for a non-existent user", () => {
      return request(app)
        .patch("/api/users/restrict/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("404: User Not Found");
        });
    });
  });
});
describe("API/EVENTS", () => {
  describe("    GET /api/events", () => {
    it("200: responds with all events", () => {
      return request(app)
        .get("/api/events")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.events)).toBe(true);
          body.events.forEach((event) => {
            expect(event).toHaveProperty("event_id", expect.any(Number));
            expect(event).toHaveProperty("title", expect.any(String));
            expect(event).toHaveProperty("description");
            expect(event).toHaveProperty("date");
            expect(event).toHaveProperty("location");
          });
        });
    });
  });

  describe("    GET /api/events/user/:user_id", () => {
    it("200: responds with an array of events the user has joined", () => {
      return request(app)
        .get("/api/events/user/1")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.events)).toBe(true);
          body.events.forEach((event) => {
            expect(event).toHaveProperty("event_id", expect.any(Number));
            expect(event).toHaveProperty("title", expect.any(String));
            expect(event).toHaveProperty("description", expect.any(String));
            expect(event).toHaveProperty("date", expect.any(String));
            expect(event).toHaveProperty("location", expect.any(String));
          });
        });
    });
  
    it("200: responds with an empty array if user has not joined any events", () => {
      return request(app)
        .get("/api/events/user/9999") 
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.events)).toBe(true);
          expect(body.events.length).toBe(0);
        });
    });
  });
  

  describe("    GET /api/events/:event_id", () => {
    it("200: responds with the correct event", () => {
      return request(app)
        .get("/api/events/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.event).toHaveProperty("event_id", 1);
          expect(body.event).toHaveProperty("title", expect.any(String));
        });
    });

    it("404: event not found", () => {
      return request(app)
        .get("/api/events/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Event Not Found");
        });
    });
  });

  describe("    GET /api/events/:event_id/members", () => {
    it("200: returns members of an event", () => {
      return request(app)
        .get("/api/events/1/members")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.members)).toBe(true);
          body.members.forEach((member) => {
            expect(member).toHaveProperty("user_id");
            expect(member).toHaveProperty("name");
            expect(member).toHaveProperty("email");
          });
        });
    });
  });

  describe("    POST /api/events/:event_id/members", () => {
    it("201: user joins the event", () => {
      return request(app)
        .post("/api/events/2/members")
        .expect(201)
        .then(({ body }) => {
          expect(body.msg).toBe("Joined event successfully");
        });
    });

    it("409: user already a member", () => {
      return request(app)
        .post("/api/events/1/members")
        .expect(409)
        .then(({ body }) => {
          expect(body.msg).toBe("Already a member");
        });
    });
  });

  describe("    DELETE /api/events/:event_id", () => {
    it("204: deletes an event", () => {
      return request(app)
        .delete("/api/events/1")
        .expect(204);
    });

    it("404: event not found", () => {
      return request(app)
        .delete("/api/events/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Event Not Found");
        });
    });
  });

  describe("    DELETE /api/events/:event_id/members/:user_id", () => {
    it("204: removes user from event", () => {
      return request(app)
        .delete("/api/events/1/members/2")
        .expect(204);
    });

  // test here that prevents staff from removing an admin. It does paass but test is failing because i need to implement a temp auth change for jest.

    it("404: user not found in event", () => {
      return request(app)
        .delete("/api/events/1/members/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Member not found in event");
        });
    });
  });
});
