const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

exports.getUsersByNames = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: req.params.name,
        },
      },
    });
    const resultList = [];
    for (let i = 0; i < users.length; i++) {
      resultList.push({
        name: users[i].name,
        phoneNumber: users[i].phoneNumber,
        createdAt: users[i].createdAt,
        spamCount: users[i].spamCount,
      });
    }
    // Sort the users array based on the substring presence in the username
    resultList.sort((user1, user2) => {
      const username1 = user1.name.toLowerCase();
      const username2 = user2.name.toLowerCase();

      if (
        username1.startsWith(req.params.name) &&
        !username2.startsWith(req.params.name)
      ) {
        return -1;
      } else if (
        !username1.startsWith(req.params.name) &&
        username2.startsWith(req.params.name)
      ) {
        return 1;
      } else {
        return 0;
      }
    });
    res.send(resultList);
  } catch (error) {
    console.error("Error:", error);
  }
};
exports.reportSpamUser = async (req, res) => {
  const userFound = await prisma.user.findFirst({
    where: { phoneNumber: req.params.phoneNumber },
  });
  if (userFound) {
    const updatedUser = await prisma.user.update({
      where: {
        phoneNumber: req.params.phoneNumber,
      },
      data: { ...userFound, spamCount: userFound.spamCount + 1 },
    });
  } else {
    const user = await prisma.user.create({
      data: {
        phoneNumber: req.params.phoneNumber,
        spamCount: 1,
      },
    });
  }
  res.send("Reported as Spam");
};
exports.getUserByNumber = async (req, res) => {
  const userFound = await prisma.user.findFirst({
    where: { phoneNumber: req.params.phoneNumber },
  });
  if (userFound) {
    const userDetails = {
      name: userFound.name,
      createdAt: userFound.createdAt,
      phoneNumber: userFound.phoneNumber,
      spamCount: userFound.spamCount,
    };
    if (userFound.contacts.find((item) => item === req.user.userId))
      userDetails["email"] = userFound.email;
    res.send(userDetails);
  } else {
    res.sendStatus(404);
  }
};

exports.loginUser = async (req, res) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    res.sendStatus(400);
    return;
  }
  const user = await prisma.user.findUnique({
    where: { phoneNumber: phoneNumber },
  });
  if (user) {
    if (user.password === password) {
      const payload = {
        userId: phoneNumber,
      };
      const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "30m",
        algorithm: "HS256",
      });
      res.send(
        `<h1>Login success</h1><br/><p>Here's the token for future requests:</p><br/> ${token}`
      );
    } else {
      res.sendStatus(403); // Forbidden
    }
  } else {
    res.sendStatus(401); //Unauthorized;
  }
};

exports.registerUser = async (req, res) => {
  const { phoneNumber, name, password, email } = req.body;
  if (!phoneNumber && !name && !password) {
    res.sendStatus(400);
    return;
  }
  try {
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        name,
        password,
        email: email,
      },
    });
    const payload = {
      userId: phoneNumber,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "30m",
      algorithm: "HS256",
    });
    res.send(
      `<h1>Successfully registered</h1><br/><p>Here's the token for future requests:</p><br/> ${token}`
    );
  } catch {
    res.sendStatus(409);
  }
};
