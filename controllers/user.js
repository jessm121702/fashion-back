require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

async function hashSubId(subId) {
    if (!subId) {
        throw new Error("subId is required for hashing.");
    }
    console.log("subId: hashsubid function 🍬🍬", subId);
    const saltRounds = 10;
    const hashedSubId = await bcrypt.hash(subId, saltRounds);
    return hashedSubId;
}

async function sendEmail(url, type, email, additionalData = {}) {
    console.log("📧 Starting email sending process...", url, type, email);

    let subject, templateFile;

    console.log("🤔 Determining email type...");
    if (type === "Seasoned Pro") {
        subject = "Welcome to the Fashion Seasoned Pro Plan! 🎉";
        templateFile = "seasoned-subscription.html";
        console.log("✅ Email type: Seasoned Pro Subscription");
    } else if (type === "Pro") {
        subject = "Welcome to the Fashion Pro Plan! 🎉";
        templateFile = "pro-subscription.html";
        console.log("✅ Email type: Pro Subscription");
    } else if (type === "Custom") {
        subject = additionalData.subject || "Custom Email";
        templateFile = "custom-email.html";
        console.log("✅ Email type: Pro Subscription");
    } else {
        console.error("❌ Unsupported email type:", type);
        return;
    }

    const htmlTemplatePath = path.join(__dirname, "..", "data", templateFile);
    if (!fs.existsSync(htmlTemplatePath)) {
        console.error("❌ Template file not found:", htmlTemplatePath);
        return;
    }

    let htmlTemplate;
    try {
        htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf-8");
        console.log("✅ Email template loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load email template:", error);
        return;
    }

    console.log("🔄 Replacing placeholders in the template...");
    if (type === "Seasoned Pro") {
        htmlTemplate = htmlTemplate.replace("{{URL}}", url);
    } else if (type === "Pro") {
        htmlTemplate = htmlTemplate.replace("{{URL}}", url);
    } else if (type === "Custom") {
        htmlTemplate = htmlTemplate
            .replace("{{CLIENT}}", additionalData.client || "")
            .replace("{{EVENT}}", additionalData.event || "")
            .replace("{{BODY}}", additionalData.body || "");
    } else {
        throw new Error(`Unsupported email type: ${type}`);
    }

    console.log("✅ Placeholders replaced successfully");

    console.log("📨 Configuring the transporter...");
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER || "muhammadmohsin1016@gmail.com",
            pass: process.env.SMTP_PASS || "puci zizd cskz gpwm",
        },
    });
    console.log("✅ Transporter configured successfully");

    const mailOptions = {
        from: "muhammadmohsin1016@gmail.com",
        to: email,
        subject: subject,
        html: htmlTemplate,
    };

    console.log("📋 Mail options prepared.");

    try {
        console.log("🚀 Sending email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully! Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Error occurred while sending email:", error);
    }
}

exports.checkSubscription = async (req, res) => {
    const { email, sub_id } = req.body;

    try {
        console.log("📩 Checking subscription for email:", email, sub_id);
        const User = await user.findOne({ where: { email } });
        if (!User) {
            console.log("❌ User not found for email:", email);
            return res.status(404).json({ message: "User not found" });
        }
        const subId = User.sub_id;

        console.log("🍇🍇  subid", subId);

        const isValidSubId = await bcrypt.compare(User.sub_id, sub_id);

        if (!isValidSubId) {
            console.log("❌ Subscription ID mismatch for user:", email);
            return res.status(400).json({ message: "Invalid subscription ID" });
        }
        console.log("✅ Subscription ID verified for user:", email);
        return res.status(200).json({ message: "Subscription is valid", User });
    } catch (error) {
        console.error("❌ Error checking subscription:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.Subscription = async (req, res) => {
    try {
        const { email, subscriptionType } = req.body;
        console.log("📩📩 email ", email, subscriptionType);

        const success_url = process.env.SUCCESS_URL;
        const cancel_url = process.env.FAILURE_URL;

        const customer = await stripe.customers.create({ email });
        console.log("✅✅ Customer created, ID:", customer.id);

        let userInstance = await user.findOne({ where: { email } });
        console.log("userInstance:  😭😭 ", userInstance);

        if (!userInstance) {
            userInstance = await user.create({ email });
        }

        userInstance.stripeCustomerId = customer.id;
        await userInstance.save();

        if (subscriptionType === "Basic") {
            let subStartDate = null;
            let subEndDate = null;

            if (userInstance.sub_end_date) {
                subStartDate = userInstance.sub_end_date;
                subEndDate = new Date(new Date(subStartDate).setMonth(new Date(subStartDate).getMonth() + 1));
            } else {
                subStartDate = new Date();
                subEndDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
            }

            console.log("⌚⌚ Subscription Dates:", subStartDate, subEndDate);

            userInstance.subscription = subscriptionType;
            userInstance.sub_status = "active";
            userInstance.sub_start_date = subStartDate;
            userInstance.sub_end_date = subEndDate;
            userInstance.sub_id = null;

            try {
                await userInstance.save();
            } catch (saveError) {
                return res.status(500).json({ message: "Failed to update subscription" });
            }

            return res.status(200).json({ message: "Basic Subscription is successfully subscribed" });
        }

        let priceId;
        let emailLimit;
        if (subscriptionType === "Seasoned Pro") {
            priceId = "price_1QYUEOLtWPu3MUMg6dXEI020";
            emailLimit = 250;
        } else if (subscriptionType === "Pro") {
            priceId = "price_1QYUOiLtWPu3MUMgUb2p53f3";
            emailLimit = 10000;
        } else {
            return res.status(400).json({ message: "Invalid subscription type" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url,
            cancel_url,
            customer_email: email,
        });

        console.log("Session is created 😉😉 ", session.url);

        res.status(200).json({ url: session.url });

        const intervalId = setInterval(async () => {
            try {
                const sessionStatus = await stripe.checkout.sessions.retrieve(session.id);

                if (sessionStatus.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(sessionStatus.subscription);
                    const subscriptionStatus = subscription.status;
                    const subscriptionStartDate = new Date(subscription.start_date * 1000);
                    const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
                    const subscriptionId = subscription.id;
                    if (subscriptionStatus === "active") {
                        await userInstance.update({
                            subscription: subscriptionType,
                            sub_status: subscriptionStatus,
                            sub_start_date: subscriptionStartDate,
                            sub_end_date: subscriptionEndDate,
                            sub_id: subscriptionId,
                            email_limit: emailLimit,
                            email_sent: 0,
                        });
                        const invoice = await stripe.invoices.create({
                            customer: userInstance.stripeCustomerId,
                            auto_advance: true,
                        });
                        await stripe.invoices.finalizeInvoice(invoice.id);
                        const subId = userInstance.sub_id;
                        console.log("🦀🦀 success of subscription", subId);
                        const hashedSubId = await hashSubId(subId);
                        console.log(" success of subscription", hashedSubId);
                        const url = `https://styloire.co/myportal?sub_id=${hashedSubId}&email=${encodeURIComponent(email)}`;
                        console.log("url 🔗🔗 ", url, email, subId, hashedSubId);
                        await sendEmail(url, subscriptionType, email);
                        clearInterval(intervalId);
                    } else {
                        console.log(`Subscription is not active yet. Current status: ${subscriptionStatus}`);
                    }
                } else if (sessionStatus.payment_status === "unpaid") {
                    console.log("Payment is still pending.");
                } else {
                    console.log("No subscription found yet.");
                }
            } catch (error) {
                console.error("Error retrieving or updating subscription:", error);
            }
        }, 5000);
    } catch (error) {
        console.error("Error updating subscription or creating Stripe session:", error);
        return res.status(500).json({ message: "Internal Server Error", key: "server_error" });
    }
};

exports.uploadCSV = async (req, res) => {
    console.log("📩 Incoming request to upload CSV.");
    const { email, emails, client, event, subject, body } = req.body;

    console.log("📋 Extracted data from request body:");
    console.log("📧 User Email:", email);
    console.log("📧 Emails:", emails);
    console.log("👤 Client:", client);
    console.log("🎉 Event:", event);
    console.log("✉️ Subject:", subject);
    console.log("📝 Body:", body);

    const emailCount = emails ? emails.length : 0;
    console.log(`📊 Total number of recipient emails: ${emailCount}`);

    if (!emails || !emails.length) {
        console.warn("⚠️ No emails provided in the request.");
        return res.status(400).json({ message: "No emails provided." });
    }

    try {
        const userEmail = typeof email === "object" ? email.email : email;
        console.log("🔍 Searching for user with email:", userEmail);
        const userInstance = await user.findOne({ where: { email: userEmail } });

        if (!userInstance) {
            console.warn("⚠️ User not found for email:", email);
            return res.status(404).json({ message: "User not found." });
        }

        console.log("✅ User found:", userInstance);

        const { email_limit, email_sent } = userInstance;
        console.log(`📧 Email limit: ${email_limit}, Emails sent: ${email_sent}`);

        if (email_limit !== null && email_sent !== null && (email_sent >= email_limit)) {
            console.warn("⚠️ User has reached or exceeded the email limit.");
            return res.status(403).json({
                message: "You have hit the email limit. Please re-subscribe to the monthly plan.",
            });
        }

        if (userInstance.sub_status !== "active") {
            console.warn("⚠️ User's subscription is not active:", userInstance.sub_status);
            return res.status(403).json({ message: "User subscription is not active." });
        }

        console.log("✅ User subscription is active. Proceeding to send emails...");

        console.log("🚀 Sending emails to the following addresses:", emails);
        await Promise.all(
            emails.map(async (recipientEmail) => {
                console.log(`📤 Preparing email for: ${recipientEmail}`);
                await sendEmail("", "Custom", recipientEmail, { client, event, subject, body });
            })
        );

        const updatedEmailSent = (email_sent || 0) + emailCount;
        await userInstance.update({ email_sent: updatedEmailSent });

        console.log("🎉 All emails processed successfully!");
        res.status(200).json({ message: "Emails sent successfully!" });
    } catch (error) {
        console.error("❌ Error occurred while sending emails:", error);
        res.status(500).json({ message: "Failed to send emails." });
    }
};


// Signup API
exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log("🚀 Signup request received", { firstName, lastName, email });
  
    try {
      // Check if the user already exists
      console.log("🔍 Checking if user already exists: ", email);
      const existingUser = await user.findOne({ where: { email } });
      if (existingUser) {
        console.log("⚠️ User already exists: ", email);
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      console.log("🔒 Hashing password for: ", email);
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      console.log("✨ Creating new user: ", email);
      const User = await user.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
  
      console.log("✅ User created successfully: ", email);
      res.status(201).json({ message: 'User created successfully', User });
    } catch (error) {
      console.log("❌ Error during signup: ", error);
      res.status(500).json({ message: 'Something went wrong', error });
    }
  };
  
  // Login API
  exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("🚀 Login request received", { email });
  
    try {
      // Check if the user exists
      console.log("🔍 Checking if user exists: ", email);
      const User = await user.findOne({ where: { email } });
      if (!User) {
        console.log("⚠️ User not found: ", email);
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Compare the password
      console.log("🔑 Comparing password for: ", email);
      const isPasswordValid = await bcrypt.compare(password, User.password);
      if (!isPasswordValid) {
        console.log("❌ Invalid credentials for: ", email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate a JWT token
      console.log("🔐 Generating JWT token for: ", email);
      const token = jwt.sign({ id: User.id, email: User.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      // Update the last login time
      console.log("⏰ Updating last login time for: ", email);
      User.lastLogin = new Date();
      await User.save();
  
      console.log("✅ Login successful for: ", email);
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.log("❌ Error during login: ", error);
      res.status(500).json({ message: 'Something went wrong', error });
    }
  };
  
  exports.isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
