import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values"; //--> v:validator

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),
});

/**
Indexes Explanation 

userId index:
U1 → [A, C]
U2 → [B]
fetch by userId


(userId, parentDocument) → documents
(U1, null) → [Doc A, Doc B]
(U1, DocA) → [Doc A1, Doc A2]
(U2, null) → [Doc X]
fetch By user id and parentdocument

User 1 have two parent document
 ├── A
 │    ├── A1
 │    ├── A2
 │    └── A3
 └── B
      ├── B1
      ├── B2
      └── B3

      (U1, null) → [A, B]

(U1, A) → [A1, A2, A3] 
(U1, B) → [B1, B2, B3]
 */
