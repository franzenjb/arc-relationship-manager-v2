# How to Export All 3,162 Counties from ArcGIS

## Quick Steps:

1. **Go to your map**: https://arc-nhq-gis.maps.arcgis.com/apps/mapviewer/index.html?layers=f3f38f8e35884d23950e1842faa861d0

2. **In the Map Viewer**:
   - Click the **layer name** in the left panel
   - Click the **three dots (...)** menu
   - Select **"Show Table"** or **"View Attribute Table"**

3. **In the Table View**:
   - Click **Options** (gear icon) or **Table Options**
   - Select **"Export"** or **"Export All"**
   - Choose **CSV** format
   - Save as `red-cross-counties.csv`

4. **Alternative Method - Direct Export**:
   - Look for **"Analysis"** or **"Tools"** menu
   - Select **"Extract Data"** 
   - Choose **"Download"**
   - Select all fields
   - Export as CSV

5. **If Those Don't Work**:
   - Click the layer
   - Choose **"View Item Details"**
   - On the item page, look for **"Export Data"** button
   - Choose **"Export to CSV"**

## What We Need:

The CSV should have these columns:
- COUNTY_NAME
- STATE_NAME or STATE_ABBR
- Division
- Region  
- Chapter
- FIPS (if available)
- Chapter_Address (if available)
- Chapter_City (if available)
- Chapter_State (if available)
- Chapter_Zip (if available)
- Chapter_Phone (if available)

## Once You Have the CSV:

1. Save it in the project folder: `/Users/jefffranzen/arc-relationship-manager-v2/`
2. Let me know and I'll process it to:
   - Create the complete geographic hierarchy
   - Update the regions configuration
   - Fix the Nebraska/Iowa mapping
   - Ensure proper chapter assignments

## Can't Export? Try This:

If export is disabled, you can:
1. Select all records (Ctrl+A in the table)
2. Copy (Ctrl+C)
3. Paste into Excel
4. Save as CSV

Or share with me:
- The REST endpoint URL (usually shown in developer tools)
- Your ArcGIS Online username (I can try to access it)
- The feature service URL from the layer properties