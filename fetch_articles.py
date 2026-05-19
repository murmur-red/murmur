import urllib.request, json, datetime, os

TOKEN = os.environ["NOTION_TOKEN"]
DB_ID = "22a87c286213-8035-bc54-e8c1f9f7108c".replace("-","",1)  # Weekly Digest DTB

def notion_req(path, method="GET", body=None):
    url = f"https://api.notion.com/v1/{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Notion-Version", "2022-06-28")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

result = notion_req(f"databases/{DB_ID}/query", "POST", {
    "sorts": [{"property": "Date", "direction": "descending"}],
    "page_size": 50
})

articles = []
for page in result.get("results", []):
    props = page.get("properties", {})

    name_prop = props.get("Name", {})
    title = name_prop.get("title", [{}])
    name = title[0].get("plain_text", "") if title else ""

    type_prop = props.get("Type", {})
    ptype = type_prop.get("select", {}).get("name", "") if type_prop.get("select") else ""

    status_prop = props.get("Status", {})
    pstatus = status_prop.get("select", {}).get("name", "") if status_prop.get("select") else ""

    date_prop = props.get("Date", {})
    date = date_prop.get("date", {}).get("start", "") if date_prop.get("date") else ""

    topic_prop = props.get("Topic", {})
    topic_rt = topic_prop.get("rich_text", [])
    topic = topic_rt[0].get("plain_text", "") if topic_rt else ""

    if ptype == "QBR" or not name or not date or pstatus == "Draft":
        continue

    articles.append({
        "id": page["id"],
        "title": name,
        "type": ptype or "Article",
        "topic": topic,
        "date": date,
        "status": pstatus,
        "url": page.get("url", "")
    })

output = {
    "updated": datetime.date.today().isoformat(),
    "articles": articles
}

with open("articles.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"Synced {len(articles)} articles")
