# ARC Relationship Manager - Complete Database Architecture

## CURRENT TABLES (What We Have)

### 1. **staff_members** (Red Cross Internal People)
- Red Cross employees and volunteers
- Includes roles, departments, contact info
- Can be assigned as relationship managers

### 2. **people** (External Contacts)
- External partners, donors, community leaders
- Linked to organizations
- Contact information and notes

### 3. **organizations** (Partner Organizations)
- Companies, nonprofits, government agencies
- Mission areas, types, contact info
- Can have primary contacts and relationship managers

### 4. **meetings** (Interaction Records)
- Scheduled meetings with organizations
- Attendees, summaries, follow-ups
- Location and date tracking

### 5. **meeting_attendees** (Junction Table)
- Links people to meetings
- Tracks who attended what

### 6. **Geographic Hierarchy**
- **divisions** - Largest geographic unit (Eastern, Western, etc.)
- **regions** - Multiple chapters (National Capital, Greater NY, etc.)
- **chapters** - Local Red Cross chapters
- **counties** - Individual counties with FIPS codes

## RECOMMENDED ADDITIONAL TABLES

### Critical Missing Tables:

#### 1. **projects** or **initiatives**
```sql
- Project/initiative name
- Lead organization
- Partner organizations
- Start/end dates
- Budget
- Status (planning, active, completed)
- Impact metrics
- Staff lead
```

#### 2. **donors** or **funding_sources**
```sql
- Donor name (person or organization)
- Donation type (monetary, in-kind, volunteer hours)
- Amount/value
- Frequency (one-time, monthly, annual)
- Restrictions (if any)
- Campaign/appeal
- Recognition level
```

#### 3. **events** (Different from meetings)
```sql
- Event name
- Event type (fundraiser, training, disaster response)
- Date/time
- Location
- Expected attendance
- Actual attendance
- Revenue/cost
- Partner organizations
```

#### 4. **documents** or **attachments**
```sql
- File name
- File type
- URL/path
- Related entity (org, person, meeting, project)
- Upload date
- Uploaded by
- Description
```

#### 5. **communications_log**
```sql
- Contact person/organization
- Communication type (email, phone, letter)
- Date/time
- Subject
- Summary
- Follow-up required
- Staff member
```

#### 6. **tasks** or **action_items**
```sql
- Task description
- Assigned to (staff member)
- Related to (org/person/project)
- Due date
- Priority
- Status
- Completed date
```

#### 7. **volunteers** (Might be separate from staff)
```sql
- Volunteer info
- Skills/certifications
- Availability
- Hours logged
- Background check status
- Training completed
```

#### 8. **disaster_responses**
```sql
- Disaster type
- Location (counties affected)
- Start date
- End date
- Resources deployed
- Partner organizations involved
- Impact metrics
```

#### 9. **grants**
```sql
- Grant name
- Funder
- Amount
- Application date
- Award date
- Reporting requirements
- Project/initiative funded
```

#### 10. **board_members** (Special type of person)
```sql
- Person ID
- Organization they represent
- Board position
- Committee memberships
- Term start/end
```

## RELATIONSHIP CONSIDERATIONS

### Key Relationships We Should Track:
1. **Organization ↔ Organization** (partnerships, parent/subsidiary)
2. **Person ↔ Person** (who knows whom)
3. **Project ↔ Multiple Organizations** (collaborative efforts)
4. **County ↔ Disaster Response** (affected areas)
5. **Staff ↔ Organizations** (who manages which relationships)

## PRIORITY FOR IMPLEMENTATION

### Phase 1 (Immediate):
✅ staff_members
✅ Geographic hierarchy (counties, chapters, regions, divisions)

### Phase 2 (Next Sprint):
- [ ] Projects/Initiatives
- [ ] Donors/Funding Sources
- [ ] Events

### Phase 3 (Future):
- [ ] Documents/Attachments
- [ ] Communications Log
- [ ] Tasks/Action Items
- [ ] Volunteers
- [ ] Disaster Responses
- [ ] Grants

## BENEFITS OF THIS ARCHITECTURE

1. **Complete Relationship Tracking**: Know who's connected to whom
2. **Geographic Intelligence**: Understand coverage by county/chapter
3. **Resource Management**: Track staff, volunteers, and funding
4. **Project Oversight**: Monitor initiatives across regions
5. **Disaster Readiness**: Quick access to resources and partners
6. **Donor Stewardship**: Track giving history and recognition
7. **Task Management**: Nothing falls through the cracks

## QUESTIONS TO CONSIDER

1. Should we track **blood drives** as a special type of event?
2. Do we need **training/certification** tracking for staff and volunteers?
3. Should we have **service delivery** metrics (meals served, shelters opened)?
4. Do we need **inventory/supplies** tracking?
5. Should we track **media contacts** separately?

This architecture provides a solid foundation for comprehensive relationship management while allowing for future expansion based on actual needs.