// Data repository for LF System (Lost and Found Management System)

let categories = [
  { CategoryID: 1, CategoryName: "Electronics & Gadgets" },
  { CategoryID: 2, CategoryName: "IDs & Cards" },
  { CategoryID: 3, CategoryName: "Bags & Wallets" },
  { CategoryID: 4, CategoryName: "Keys & Lanyards" },
  { CategoryID: 5, CategoryName: "Books & Stationery" },
  { CategoryID: 6, CategoryName: "Apparel & Accessories" },
  { CategoryID: 7, CategoryName: "Other Items" }
];

let locations = [
  { LocationID: 1, LocationName: "Central Library - 2nd Floor" },
  { LocationID: 2, LocationName: "Student Union Cafeteria" },
  { LocationID: 3, LocationName: "Engineering Block B (Room 304)" },
  { LocationID: 4, LocationName: "Science Complex Quad" },
  { LocationID: 5, LocationName: "Campus Sports Center & Gym" },
  { LocationID: 6, LocationName: "Main Gate Bus Terminal" }
];

let users = [
  {
    UserID: 1,
    StudentID: "STU-2024-8891",
    Name: "Alex Morgan",
    Email: "alex.m@university.edu",
    Phone: "+1 (555) 234-5678",
    Password: "password123",
    RoleID: 1, // User
    RoleName: "User",
    ProfileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
  },
  {
    UserID: 2,
    StudentID: "STU-2024-9912",
    Name: "Sarah Jenkins",
    Email: "sarah.j@university.edu",
    Phone: "+1 (555) 876-5432",
    Password: "password123",
    RoleID: 1, // User
    RoleName: "User",
    ProfileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250"
  },
  {
    UserID: 3,
    StudentID: "ADM-2024-0001",
    Name: "Chief Admin (Campus Safety)",
    Email: "admin.safety@university.edu",
    Phone: "+1 (555) 000-9999",
    Password: "adminpassword",
    RoleID: 2, // Admin
    RoleName: "Admin",
    ProfileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
  }
];

let lostItems = [
  {
    LostID: 101,
    UserID: 1,
    CategoryID: 1,
    LocationID: 1,
    ItemName: "Apple MacBook Pro 14 (Space Gray)",
    Brand: "Apple",
    Color: "Space Gray",
    Description: "Left my MacBook on table 4 near the window on the 2nd floor library. Has a distinctive NASA sticker on top cover.",
    DateLost: "2026-07-28",
    Image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    Status: "Lost", // Lost, Claimed, Resolved
    CreatedAt: "2026-07-28T10:15:00Z"
  },
  {
    LostID: 102,
    UserID: 2,
    CategoryID: 2,
    LocationID: 2,
    ItemName: "Student ID Card - Sarah Jenkins",
    Brand: "University ID",
    Color: "Blue/White",
    Description: "Lost my official campus student card along with a black leather lanyard during lunch rush.",
    DateLost: "2026-07-29",
    Image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600",
    Status: "Lost",
    CreatedAt: "2026-07-29T14:30:00Z"
  },
  {
    LostID: 103,
    UserID: 1,
    CategoryID: 3,
    LocationID: 5,
    ItemName: "Leather Wallet with Credit Cards",
    Brand: "Fossil",
    Color: "Brown",
    Description: "Brown genuine leather bi-fold wallet lost near gym locker room. Contains driver license and student ID.",
    DateLost: "2026-07-27",
    Image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600",
    Status: "Lost",
    CreatedAt: "2026-07-27T18:20:00Z"
  }
];

let foundItems = [
  {
    FoundID: 201,
    UserID: 2,
    CategoryID: 1,
    LocationID: 1,
    ItemName: "Silver MacBook Laptop",
    Brand: "Apple",
    Color: "Space Gray",
    Description: "Found a Space Gray Apple laptop left unattended on the library 2nd floor studying desk. Handed over to lost & found desk.",
    DateFound: "2026-07-28",
    Image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    Status: "Available", // Available, Claimed, Handed over
    CreatedAt: "2026-07-28T12:00:00Z"
  },
  {
    FoundID: 202,
    UserID: 1,
    CategoryID: 4,
    LocationID: 3,
    ItemName: "Car Key Fob (Toyota)",
    Brand: "Toyota",
    Color: "Black",
    Description: "Found a electronic smart key fob with a red keychain near Engineering Block B stairs.",
    DateFound: "2026-07-29",
    Image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=600",
    Status: "Available",
    CreatedAt: "2026-07-29T09:45:00Z"
  },
  {
    FoundID: 203,
    UserID: 3,
    CategoryID: 3,
    LocationID: 5,
    ItemName: "Brown Leather Wallet",
    Brand: "Fossil",
    Color: "Brown",
    Description: "Found brown wallet turned in at Gym reception counter.",
    DateFound: "2026-07-27",
    Image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600",
    Status: "Claimed",
    CreatedAt: "2026-07-27T19:00:00Z"
  }
];

let claims = [
  {
    ClaimID: 301,
    LostID: 101,
    FoundID: 201,
    OwnerID: 1, // Alex Morgan
    FinderID: 2, // Sarah Jenkins
    Proof: "I can provide the serial number C02XG012LVD2 matching the box purchase invoice and screen password unlock pattern.",
    ContactInfo: "alex.m@university.edu | Phone: +1 (555) 234-5678",
    Status: "Pending", // Pending, Approved, Rejected
    AdminNotes: "",
    SubmittedAt: "2026-07-29T16:00:00Z"
  }
];

let notifications = [
  {
    NotificationID: 401,
    UserID: 1,
    Message: "Automated Match Found! Your reported Lost item 'Apple MacBook Pro 14' matches a Found item with 92% confidence score.",
    Date: "2026-07-28T12:05:00Z",
    Status: "Unread",
    Type: "Match"
  },
  {
    NotificationID: 402,
    UserID: 2,
    Message: "Claim Notification: Alex Morgan has submitted an ownership claim for the MacBook laptop you turned in.",
    Date: "2026-07-29T16:01:00Z",
    Status: "Read",
    Type: "Claim"
  }
];

let messages = [
  {
    MessageID: 501,
    SenderID: 1,
    ReceiverID: 2,
    ItemID: 201,
    MessageText: "Hi Sarah! Thank you so much for turning in my MacBook. Did you leave it at the library reception?",
    Timestamp: "2026-07-28T13:00:00Z"
  },
  {
    MessageID: 502,
    SenderID: 2,
    ReceiverID: 1,
    ItemID: 201,
    MessageText: "Yes! I gave it directly to Mr. Roberts at the 1st floor information desk. You can claim it there!",
    Timestamp: "2026-07-28T13:05:00Z"
  }
];

module.exports = {
  categories,
  locations,
  users,
  lostItems,
  foundItems,
  claims,
  notifications,
  messages
};
