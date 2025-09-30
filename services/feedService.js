function getMockFeed() {
  return [
    { id: "p1", author: "Ashu", role: "player", caption: "Nice session today!", imageUrl: "", likes: 10 },
    { id: "p2", author: "Valaxia Academy", role: "academy", caption: "Trials open next week", imageUrl: "", likes: 25 },
    { id: "p3", author: "Ravi", role: "scout", caption: "Spotlight on upcoming talent", imageUrl: "", likes: 7 },
    { id: "p4", author: "Priya", role: "player", caption: "Net practice wins again", imageUrl: "", likes: 3 },
  ];
}

module.exports = { getMockFeed };
