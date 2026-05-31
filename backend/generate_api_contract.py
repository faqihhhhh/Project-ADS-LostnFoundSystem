"""
Generates a complete, professional API Contract PDF for IPB Lost & Found System.
Usage: venv\\Scripts\\python.exe generate_api_contract.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import Flowable
from datetime import datetime

# ─── COLOR PALETTE ───────────────────────────────────────────────────────────
BRAND_GREEN   = colors.HexColor("#2D6A4F")   # primary
BRAND_DARK    = colors.HexColor("#1B4332")   # headings
BRAND_LIGHT   = colors.HexColor("#D8F3DC")   # row alternate
ACCENT_BLUE   = colors.HexColor("#1565C0")   # method: GET
ACCENT_GREEN  = colors.HexColor("#2E7D32")   # method: POST
ACCENT_ORANGE = colors.HexColor("#E65100")   # method: PATCH / PUT
ACCENT_RED    = colors.HexColor("#C62828")   # method: DELETE
ACCENT_GREY   = colors.HexColor("#546E7A")   # optional/note
LIGHT_BG      = colors.HexColor("#F5FAF7")
TABLE_HEADER  = colors.HexColor("#1B4332")
ROW_ALT       = colors.HexColor("#EBF5EE")
ROW_WHITE     = colors.white
BORDER_COLOR  = colors.HexColor("#B7DFC4")
TEXT_DARK     = colors.HexColor("#1A1A2E")
TEXT_MUTED    = colors.HexColor("#546E7A")

# ─── STYLES ──────────────────────────────────────────────────────────────────
base_styles = getSampleStyleSheet()

def S(name, **kw):
    """Quick ParagraphStyle factory."""
    parent = kw.pop("parent", "Normal")
    return ParagraphStyle(name, parent=base_styles[parent], **kw)

STYLES = {
    "title": S("title", fontSize=28, textColor=BRAND_DARK,
               fontName="Helvetica-Bold", alignment=TA_CENTER,
               spaceAfter=6, leading=34),
    "subtitle": S("subtitle", fontSize=13, textColor=ACCENT_GREY,
                  fontName="Helvetica", alignment=TA_CENTER,
                  spaceAfter=4),
    "h1": S("h1", fontSize=18, textColor=BRAND_DARK,
             fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=4),
    "h2": S("h2", fontSize=13, textColor=BRAND_GREEN,
             fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=3),
    "h3": S("h3", fontSize=11, textColor=TEXT_DARK,
             fontName="Helvetica-Bold", spaceBefore=6, spaceAfter=2),
    "body": S("body", fontSize=9, textColor=TEXT_DARK,
               fontName="Helvetica", leading=14, spaceAfter=3),
    "body_small": S("body_small", fontSize=8, textColor=TEXT_MUTED,
                    fontName="Helvetica", leading=12),
    "code": S("code", fontSize=8, textColor=BRAND_DARK,
               fontName="Courier", leading=12, backColor=LIGHT_BG),
    "note": S("note", fontSize=8, textColor=ACCENT_GREY,
               fontName="Helvetica-Oblique", leading=12),
    "toc_h1": S("toc_h1", fontSize=11, fontName="Helvetica-Bold",
                  textColor=BRAND_DARK, spaceAfter=2),
    "toc_item": S("toc_item", fontSize=9, fontName="Helvetica",
                  textColor=TEXT_DARK, spaceAfter=1, leftIndent=14),
    "tag_get": S("tag_get", fontSize=9, fontName="Helvetica-Bold",
                  textColor=colors.white, backColor=ACCENT_BLUE),
    "tag_post": S("tag_post", fontSize=9, fontName="Helvetica-Bold",
                   textColor=colors.white, backColor=ACCENT_GREEN),
    "tag_patch": S("tag_patch", fontSize=9, fontName="Helvetica-Bold",
                    textColor=colors.white, backColor=ACCENT_ORANGE),
    "tag_delete": S("tag_delete", fontSize=9, fontName="Helvetica-Bold",
                     textColor=colors.white, backColor=ACCENT_RED),
    "endpoint_path": S("endpoint_path", fontSize=10, fontName="Courier-Bold",
                        textColor=BRAND_DARK, leading=14),
    "cell": S("cell", fontSize=8.5, fontName="Helvetica",
               textColor=TEXT_DARK, leading=12),
    "cell_bold": S("cell_bold", fontSize=8.5, fontName="Helvetica-Bold",
                    textColor=TEXT_DARK, leading=12),
    "cell_code": S("cell_code", fontSize=8, fontName="Courier",
                    textColor=BRAND_DARK, leading=12, backColor=LIGHT_BG),
    "cell_req": S("cell_req", fontSize=8, fontName="Helvetica-Bold",
                   textColor=ACCENT_RED, leading=12),
    "cell_opt": S("cell_opt", fontSize=8, fontName="Helvetica",
                   textColor=ACCENT_GREY, leading=12),
}

def P(text, style="body"):
    return Paragraph(str(text), STYLES[style])

def HR(color=BRAND_GREEN, thickness=1):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=4, spaceBefore=4)

def space(h=6):
    return Spacer(1, h)

# ─── METHOD BADGE ─────────────────────────────────────────────────────────────
METHOD_COLORS = {
    "GET":    ACCENT_BLUE,
    "POST":   ACCENT_GREEN,
    "PATCH":  ACCENT_ORANGE,
    "DELETE": ACCENT_RED,
}

def method_table(method, path, description="", auth=""):
    method_color = METHOD_COLORS.get(method, ACCENT_GREY)
    m_style = TableStyle([
        ("BACKGROUND", (0,0), (0,0), method_color),
        ("BACKGROUND", (1,0), (1,0), LIGHT_BG),
        ("TEXTCOLOR", (0,0), (0,0), colors.white),
        ("TEXTCOLOR", (1,0), (1,0), BRAND_DARK),
        ("FONTNAME", (0,0), (0,0), "Helvetica-Bold"),
        ("FONTNAME", (1,0), (1,0), "Courier-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("ALIGN", (0,0), (0,0), "CENTER"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("PADDING", (0,0), (-1,-1), 5),
        ("BOX", (0,0), (-1,-1), 0.8, method_color),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [None]),
    ])
    
    if auth:
        auth_color = ACCENT_ORANGE if "Admin" in auth else (ACCENT_GREEN if "Mahasiswa" in auth else ACCENT_GREY)
        auth_cell = Paragraph(f"🔒 {auth}", ParagraphStyle("a", fontSize=8,
            fontName="Helvetica-Bold", textColor=auth_color))
        data = [[
            Paragraph(method, ParagraphStyle("m", fontSize=9, fontName="Helvetica-Bold",
                       textColor=colors.white, alignment=TA_CENTER)),
            Paragraph(path, ParagraphStyle("p", fontSize=9, fontName="Courier-Bold",
                       textColor=BRAND_DARK)),
            auth_cell
        ]]
        col_widths = [1.2*cm, 10*cm, 4.8*cm]
    else:
        data = [[
            Paragraph(method, ParagraphStyle("m", fontSize=9, fontName="Helvetica-Bold",
                       textColor=colors.white, alignment=TA_CENTER)),
            Paragraph(path, ParagraphStyle("p", fontSize=9, fontName="Courier-Bold",
                       textColor=BRAND_DARK)),
        ]]
        col_widths = [1.2*cm, 14.8*cm]
    
    t = Table(data, colWidths=col_widths)
    t.setStyle(m_style)
    
    if auth:
        t.setStyle(TableStyle([
            ("BACKGROUND", (2,0), (2,0), colors.HexColor("#FFF8E1")),
        ]))
    return t

def params_table(rows, caption="Parameters"):
    """rows: list of [name, type, required, description]"""
    header = [P("Field", "cell_bold"), P("Type", "cell_bold"),
               P("Required", "cell_bold"), P("Description", "cell_bold")]
    data = [header]
    for r in rows:
        req_style = "cell_req" if r[2] in ("✔ Required", "Yes", "required") else "cell_opt"
        data.append([
            P(r[0], "cell_code"),
            P(r[1], "cell"),
            P(r[2], req_style),
            P(r[3], "cell"),
        ])
    
    col_widths = [3.5*cm, 2.5*cm, 2.2*cm, 7.8*cm]
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TABLE_HEADER),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [ROW_WHITE, ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("PADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    return t

def response_table(rows, caption="Response Fields"):
    header = [P("Field", "cell_bold"), P("Type", "cell_bold"), P("Description", "cell_bold")]
    data = [header]
    for r in rows:
        data.append([P(r[0], "cell_code"), P(r[1], "cell"), P(r[2], "cell")])
    
    col_widths = [3.8*cm, 2.5*cm, 9.7*cm]
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TABLE_HEADER),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [ROW_WHITE, ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("PADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    return t

def enum_table(name, values, description=""):
    data = [[P("Enum: " + name, "cell_bold"), P("Valid Values", "cell_bold")]]
    vals = ", ".join([f'"{v}"' for v in values])
    data.append([P(name, "cell_code"), P(vals, "cell")])
    col_widths = [3.8*cm, 12.2*cm]
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#546E7A")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("PADDING", (0,0), (-1,-1), 5),
    ]))
    return t

def json_block(text):
    """Render a code/JSON block."""
    lines = text.strip().split('\n')
    data = [[Paragraph(line.replace(" ", "&nbsp;"), ParagraphStyle(
        "json_line", fontSize=8, fontName="Courier", textColor=BRAND_DARK,
        leading=11, backColor=LIGHT_BG))] for line in lines]
    t = Table(data, colWidths=[16*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_BG),
        ("BOX", (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,0), (0,0), 6),
        ("BOTTOMPADDING", (0,-1), (0,-1), 6),
        ("INNERGRID", (0,0), (-1,-1), 0, colors.white),
    ]))
    return t

def section_header(title, level=1):
    items = []
    if level == 1:
        items.append(space(10))
        items.append(HR(BRAND_DARK, 2))
        items.append(P(title, "h1"))
        items.append(HR(BRAND_GREEN, 0.5))
    elif level == 2:
        items.append(space(6))
        items.append(P(title, "h2"))
        items.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceAfter=3))
    else:
        items.append(space(4))
        items.append(P(title, "h3"))
    return items

def info_box(text, bg=LIGHT_BG, border=BRAND_GREEN):
    data = [[Paragraph(text, ParagraphStyle("ib", fontSize=8.5, fontName="Helvetica",
                        textColor=BRAND_DARK, leading=13))]]
    t = Table(data, colWidths=[16*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("BOX", (0,0), (-1,-1), 1, border),
        ("PADDING", (0,0), (-1,-1), 8),
    ]))
    return t

# ─── DOCUMENT BUILD ──────────────────────────────────────────────────────────

def build():
    out = "API_Contract.pdf"
    doc = SimpleDocTemplate(
        out,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title="IPB Lost & Found — API Contract",
        author="IPB Lost & Found Team",
    )

    story = []

    # ═══════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ═══════════════════════════════════════════════════════════════════════
    story += [
        space(60),
        P("IPB Lost &amp; Found System", "title"),
        P("API Contract v1.0", "subtitle"),
        space(8),
        HR(BRAND_GREEN, 2),
        space(6),
        P("Complete REST API Reference for Frontend Developers and AI Agents", "subtitle"),
        space(6),
        HR(BRAND_GREEN, 2),
        space(20),
    ]

    meta = [
        ["Base URL (Production)", "https://project-ads-lostn-found-system.vercel.app (frontend)"],
        ["Base URL (Backend)", "https://[railway-or-render-url]/  (FastAPI)"],
        ["Auth Scheme", "Bearer Token (JWT)  —  Header: Authorization: Bearer <token>"],
        ["Content-Type", "application/json  (multipart/form-data for file uploads)"],
        ["API Version", "1.0.0"],
        ["Framework", "FastAPI (Python)  +  PostgreSQL"],
        ["Generated", datetime.now().strftime("%Y-%m-%d %H:%M WIB")],
    ]
    meta_table = Table([[P(r[0], "cell_bold"), P(r[1], "cell")] for r in meta],
                       colWidths=[4.5*cm, 11.5*cm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_BG),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [ROW_WHITE, ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("PADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    story.append(meta_table)
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("Table of Contents", 1)
    toc = [
        ("1. Overview & Architecture", [
            "1.1 System Description",
            "1.2 Role-Based Access Control",
            "1.3 Authentication Flow",
            "1.4 Common HTTP Status Codes",
            "1.5 Pagination Parameters",
        ]),
        ("2. Enumeration Reference", [
            "2.1 ItemType", "2.2 ItemStatus", "2.3 ItemCategory",
            "2.4 ItemLocation", "2.5 IPBLocation", "2.6 ClaimStatus",
            "2.7 FoundReportStatus", "2.8 MatchStatus", "2.9 UserRole", "2.10 TimePeriod",
        ]),
        ("3. Auth Endpoints  /auth", [
            "3.1 POST /auth/login",
            "3.2 GET /auth/me",
        ]),
        ("4. Items Endpoints  /items", [
            "4.1 GET /items  — Public Item List",
            "4.2 GET /items/admin/all  — Admin Full List",
            "4.3 GET /items/{item_id}  — Item Detail",
            "4.4 POST /items  — Report Item",
            "4.5 POST /items/{item_id}/foto  — Upload Photo",
            "4.6 POST /items/{item_id}/bukti-kepemilikan  — Upload Ownership Proof",
            "4.7 DELETE /items/{item_id}  — Delete Item",
        ]),
        ("5. Claims Endpoints  /claims", [
            "5.1 POST /claims  — Submit Claim",
            "5.2 POST /claims/{claim_id}/bukti  — Upload Evidence",
            "5.3 GET /claims/me  — My Claims",
            "5.4 GET /claims  — All Claims (Admin)",
            "5.5 PATCH /claims/{claim_id}/approve  — Approve Claim",
            "5.6 PATCH /claims/{claim_id}/reject  — Reject Claim",
            "5.7 GET /claims/{claim_id}/kode  — Get Pickup Code",
        ]),
        ("6. Found Reports Endpoints  /found-reports", [
            "6.1 POST /found-reports  — Submit Found Report",
            "6.2 POST /found-reports/{report_id}/foto  — Upload Photo",
            "6.3 GET /found-reports/me  — My Reports",
            "6.4 GET /found-reports  — All Pending Reports (Admin)",
            "6.5 GET /found-reports/{report_id}/kode  — Get Pickup Code",
            "6.6 PATCH /found-reports/{report_id}/approve  — Approve Report",
            "6.7 PATCH /found-reports/{report_id}/reject  — Reject Report",
        ]),
        ("7. Matches Endpoints  /matches", [
            "7.1 GET /matches  — List Pending Matches",
            "7.2 PATCH /matches/{match_id}/confirm  — Confirm Match",
            "7.3 PATCH /matches/{match_id}/reject  — Reject Match",
        ]),
        ("8. Notifications Endpoints  /notifications", [
            "8.1 GET /notifications  — Get My Notifications",
            "8.2 PATCH /notifications/read  — Mark All as Read",
        ]),
        ("9. Leaderboard Endpoints  /leaderboard", [
            "9.1 GET /leaderboard  — Get Leaderboard",
            "9.2 GET /leaderboard/me/riwayat  — My Points History",
        ]),
        ("10. Data Models Reference", [
            "10.1 User", "10.2 Item", "10.3 Claim",
            "10.4 FoundReport", "10.5 ItemMatch", "10.6 Notification", "10.7 PointLog",
        ]),
        ("11. Business Logic & Rules", [
            "11.1 Points System",
            "11.2 Auto-Match Engine",
            "11.3 Item Expiry",
            "11.4 Pickup Codes",
        ]),
    ]
    for main, subs in toc:
        story.append(P(main, "toc_h1"))
        for s in subs:
            story.append(P(s, "toc_item"))
        story.append(space(3))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 1: OVERVIEW
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("1. Overview & Architecture", 1)

    # 1.1
    story += section_header("1.1 System Description", 2)
    story.append(info_box(
        "IPB Lost &amp; Found is a web platform for IPB University students and administrators to manage lost "
        "and found items across campus. Students (mahasiswa) can report lost/found items, submit ownership "
        "claims, and earn points. Admins review claims, approve/reject matches, and manage the item lifecycle. "
        "The backend is a FastAPI REST API with PostgreSQL database."
    ))
    story.append(space(6))

    # 1.2 RBAC
    story += section_header("1.2 Role-Based Access Control (RBAC)", 2)
    rbac_data = [
        [P("Role", "cell_bold"), P("Description", "cell_bold"), P("Access Level", "cell_bold")],
        [P("Guest", "cell"), P("Unauthenticated visitor", "cell"),
         P("Can browse public item list and leaderboard only", "cell")],
        [P("mahasiswa", "cell"), P("Authenticated student with NIM", "cell"),
         P("Report items, submit claims, upload evidence, view own data, earn points", "cell")],
        [P("admin", "cell"), P("System administrator", "cell"),
         P("Full access: approve/reject claims & reports, manage matches, view all data, delete items", "cell")],
    ]
    rbac_t = Table(rbac_data, colWidths=[2.5*cm, 4*cm, 9.5*cm])
    rbac_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TABLE_HEADER),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [ROW_WHITE, ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("PADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ]))
    story.append(rbac_t)
    story.append(space(6))

    # 1.3 Auth Flow
    story += section_header("1.3 Authentication Flow", 2)
    story.append(P("1. Call <b>POST /auth/login</b> with username &amp; password.", "body"))
    story.append(P("2. Receive <b>access_token</b> (JWT) in the response.", "body"))
    story.append(P("3. Include token in every protected request header:", "body"))
    story.append(json_block("Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."))
    story.append(space(4))
    story.append(P("Token contains: <b>sub</b> (username), <b>exp</b> (expiry). Algorithm: HS256.", "body"))
    story.append(space(6))

    # 1.4 Status Codes
    story += section_header("1.4 Common HTTP Status Codes", 2)
    sc_data = [
        [P("Code", "cell_bold"), P("Meaning", "cell_bold"), P("Typical Scenario", "cell_bold")],
        [P("200 OK", "cell"), P("Success", "cell"), P("GET request returned data successfully", "cell")],
        [P("201 Created", "cell"), P("Resource created", "cell"), P("POST created a new item/claim/report", "cell")],
        [P("400 Bad Request", "cell"), P("Validation error", "cell"), P("Missing required field or invalid enum value", "cell")],
        [P("401 Unauthorized", "cell"), P("Not authenticated", "cell"), P("No/invalid/expired Bearer token", "cell")],
        [P("403 Forbidden", "cell"), P("Insufficient role", "cell"), P("Mahasiswa accessing admin-only endpoint", "cell")],
        [P("404 Not Found", "cell"), P("Resource not found", "cell"), P("item_id, claim_id, report_id not found in DB", "cell")],
        [P("422 Unprocessable", "cell"), P("Schema error", "cell"), P("Invalid field type or enum value in request body", "cell")],
        [P("500 Internal Error", "cell"), P("Server error", "cell"), P("Unexpected error (report to dev team)", "cell")],
    ]
    sc_t = Table(sc_data, colWidths=[2.8*cm, 3*cm, 10.2*cm])
    sc_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TABLE_HEADER),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [ROW_WHITE, ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("PADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ]))
    story.append(sc_t)
    story.append(space(6))

    # 1.5 Pagination
    story += section_header("1.5 Pagination Query Parameters", 2)
    story.append(P("All list endpoints support the following query parameters:", "body"))
    story.append(params_table([
        ["skip", "integer", "Optional", "Number of records to skip. Default: 0. Minimum: 0"],
        ["limit", "integer", "Optional", "Max records to return. Default: 24. Range: 1–100"],
    ]))
    story.append(space(4))
    story.append(P("<b>Example:</b> GET /items?skip=24&amp;limit=12  — retrieves page 2 with 12 items per page.", "body"))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 2: ENUMERATIONS
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("2. Enumeration Reference", 1)
    story.append(info_box(
        "All enum fields must use the exact string values listed below. "
        "Sending an invalid enum value will return HTTP 422 Unprocessable Entity."
    ))
    story.append(space(6))

    enums = [
        ("2.1 ItemType", "ItemType",
         ["LOST", "FOUND"],
         "Defines whether the item is a lost item report or a found item report."),
        ("2.2 ItemStatus", "ItemStatus",
         ["OPEN", "PENDING", "CLOSED", "EXPIRED"],
         "OPEN: active and searchable. PENDING: has an active claim/report under review. "
         "CLOSED: resolved. EXPIRED: no activity for 30 days."),
        ("2.3 ItemCategory", "ItemCategory",
         ["elektronik", "dompet", "kunci", "kartu", "pakaian", "tas", "botol", "lainnya"],
         "Category of the item. Used for filtering and auto-match scoring."),
        ("2.4 TimePeriod", "TimePeriod",
         ["today", "this_week", "this_month", "all_time"],
         "Time filter for item listing. Filters by tanggal (incident date)."),
        ("2.5 ClaimStatus", "ClaimStatus",
         ["PENDING", "APPROVED", "REJECTED"],
         "Status of an ownership claim submitted by a mahasiswa."),
        ("2.6 FoundReportStatus", "FoundReportStatus",
         ["PENDING", "APPROVED", "REJECTED"],
         "Status of a found-item report submitted by a mahasiswa."),
        ("2.7 MatchStatus", "MatchStatus",
         ["PENDING", "CONFIRMED", "REJECTED"],
         "Status of an auto-detected match between a FOUND item and a LOST item."),
        ("2.8 UserRole", "UserRole",
         ["mahasiswa", "admin"],
         "Role determines which endpoints are accessible."),
    ]

    for title, name, vals, desc in enums:
        story += section_header(title, 2)
        story.append(P(desc, "body"))
        story.append(space(2))
        story.append(enum_table(name, vals))
        story.append(space(4))

    # ItemLocation
    story += section_header("2.9 ItemLocation (lokasi_ditemukan_list / lokasi_kemungkinan_list)", 2)
    story.append(P("Campus area locations — used for structured location tagging to enable auto-match.", "body"))
    story.append(space(2))
    il_vals = [
        "Common Class Room (CCR)", "Gedung Kuliah Bersama (GKB)", "Perpustakaan Pusat",
        "Masjid Al-Hurriyyah", "Gymnasium", "Auditorium Andi Hakim Nasoetion",
        "Asrama Putra (Astra)", "Asrama Putri (Astri)", "Kantin Stevia", "Kantin Ungu",
        "Blue Corner", "Yellow Corner", "Kantin Nays", "Kantin Rimbawan", "Kantin Sapta",
        "Kantin Plasma", "Kantin Empat (Kanpat)", "Kantin Ibu Sayang", "Kantin Makjan",
        "Fakultas Pertanian (Faperta)", "Fakultas Kedokteran Hewan (FKH)",
        "Fakultas Perikanan dan Ilmu Kelautan (FPIK)", "Fakultas Peternakan (Fapet)",
        "Fakultas Kehutanan dan Lingkungan (Fahutan)", "Fakultas Teknologi Pertanian (Fateta)",
        "Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)",
        "Fakultas Ekonomi dan Manajemen (FEM)", "Fakultas Ekologi Manusia (FEMA)",
        "Sekolah Kedokteran Hewan dan Biomedis (SKHB)", "Sekolah Bisnis (SB)",
        "Sekolah Vokasi (SV)", "Halte Bus / Lintas", "Area Jalanan Kampus", "Lainnya",
    ]
    il_text = " | ".join([f'"{v}"' for v in il_vals])
    story.append(info_box(il_text))
    story.append(space(6))

    # IPBLocation
    story += section_header("2.10 IPBLocation (lokasi_sekarang)", 2)
    story.append(P(
        "Specific handover/storage locations on campus. Used for FOUND items to indicate "
        "where the item is currently being kept (e.g., security post, admin desk).", "body"))
    story.append(space(2))
    ipb_vals = [
        "Pos Satpam Faperta", "Pos Satpam SKHB", "Pos Satpam FPIK", "Pos Satpam Fapet",
        "Pos Satpam Fahutan", "Pos Satpam Fateta", "Pos Satpam FMIPA", "Pos Satpam FEM",
        "Pos Satpam Fema", "Meja Informasi CCR Lantai 1",
        "Meja Sirkulasi Perpustakaan Pusat", "Lobi Utama Gedung Kuliah Bersama (GKB)",
        "Sekretariat Masjid Al-Hurriyyah", "Pos Keamanan Pintu Utama GWW",
        "Ruang Pengelola Gymnasium", "Resepsionis Klinik IPB Dramaga",
        "Pos Pengamanan Lobi Rektorat AHN", "Sekretariat BEM KM IPB (Student Center)",
        "Kantor Pengelola Asrama PKU Putra", "Kantor Pengelola Asrama PKU Putri",
        "Pos Penjagaan Asrama Sylvapinus", "Shelter Bus Kampus Rektorat",
    ]
    ipb_text = " | ".join([f'"{v}"' for v in ipb_vals])
    story.append(info_box(ipb_text))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 3: AUTH
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("3. Auth Endpoints  /auth", 1)

    # 3.1 Login
    story += section_header("3.1 Login", 2)
    story.append(method_table("POST", "/auth/login", auth="Public (no auth required)"))
    story.append(space(3))
    story.append(P("Authenticates a user and returns a JWT access token.", "body"))
    story.append(space(3))
    story.append(P("<b>Request Body (JSON):</b>", "body"))
    story.append(params_table([
        ["username", "string", "✔ Required", "The user's username"],
        ["password", "string", "✔ Required", "The user's password (plaintext, hashed server-side)"],
    ]))
    story.append(space(3))
    story.append(P("<b>Request Example:</b>", "body"))
    story.append(json_block('{\n  "username": "budi_santoso",\n  "password": "mypassword123"\n}'))
    story.append(space(3))
    story.append(P("<b>Response 200 OK:</b>", "body"))
    story.append(response_table([
        ["access_token", "string", "JWT token to use in Authorization header"],
        ["token_type", "string", 'Always "bearer"'],
        ["role", "UserRole", '"mahasiswa" or "admin"'],
        ["nama", "string", "User's display name"],
    ]))
    story.append(space(3))
    story.append(P("<b>Response Example:</b>", "body"))
    story.append(json_block(
        '{\n'
        '  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n'
        '  "token_type": "bearer",\n'
        '  "role": "mahasiswa",\n'
        '  "nama": "Budi Santoso"\n'
        '}'
    ))
    story.append(space(4))
    story.append(P("<b>Error Responses:</b>", "body"))
    story.append(info_box("401 — Credentials invalid (wrong username or password)"))
    story.append(space(6))

    # 3.2 Get Me
    story += section_header("3.2 Get Current User Profile", 2)
    story.append(method_table("GET", "/auth/me", auth="Any logged-in user"))
    story.append(space(3))
    story.append(P("Returns the profile of the currently authenticated user.", "body"))
    story.append(space(3))
    story.append(P("<b>Response 200 OK:</b>", "body"))
    story.append(response_table([
        ["id", "integer", "User's unique ID"],
        ["username", "string", "User's username"],
        ["nim", "string | null", "Student NIM (null for admin)"],
        ["nama", "string", "User's full name"],
        ["email", "string", "User's email address"],
        ["role", "UserRole", '"mahasiswa" or "admin"'],
        ["poin", "integer", "Total accumulated points"],
    ]))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 4: ITEMS
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("4. Items Endpoints  /items", 1)
    story.append(info_box(
        "Items are the core entity of the system. An item can be either LOST (barang hilang reported by owner) "
        "or FOUND (barang temuan reported by finder). Each has different required fields.\n\n"
        "<b>Privacy rule:</b> Public responses (ItemOutPublik) hide: deskripsi_detail, lokasi_sekarang, "
        "bukti_kepemilikan. Full responses (ItemOut) are returned only to the owner, the finder, or admin."
    ))
    story.append(space(4))

    # 4.1 List Items
    story += section_header("4.1 List Items (Public)", 2)
    story.append(method_table("GET", "/items", auth="Public (optional auth)"))
    story.append(space(3))
    story.append(P("Returns a paginated list of items. Supports filtering by type, category, location, status, and search. "
                   "If authenticated, the response includes photos for FOUND items. "
                   "Unauthenticated guests see items without photos.", "body"))
    story.append(space(3))
    story.append(P("<b>Query Parameters:</b>", "body"))
    story.append(params_table([
        ["tipe", "ItemType", "Optional", "Filter by type: LOST or FOUND"],
        ["kategori", "ItemCategory", "Optional", "Filter by category"],
        ["lokasi", "ItemLocation", "Optional", "Filter by area location (lokasi_ditemukan_list or lokasi_kemungkinan_list)"],
        ["status", "ItemStatus", "Optional", "Filter by status: OPEN, PENDING, CLOSED, EXPIRED"],
        ["q", "string", "Optional", "Free-text search on nama_publik"],
        ["period", "TimePeriod", "Optional", "Time filter: today, this_week, this_month, all_time"],
        ["skip", "integer", "Optional", "Pagination offset. Default: 0"],
        ["limit", "integer", "Optional", "Page size. Default: 24, max: 100"],
    ]))
    story.append(space(3))
    story.append(P("<b>Response 200 OK — Array of ItemOutPublik:</b>", "body"))
    story.append(response_table([
        ["id", "integer", "Item unique ID"],
        ["user_id", "integer", "ID of reporter (used by frontend to check isOwner)"],
        ["tipe", "ItemType", "LOST or FOUND"],
        ["status", "ItemStatus", "Current status"],
        ["kategori", "ItemCategory", "Item category"],
        ["nama_publik", "string", "Generic public name (e.g. 'Dompet Hitam')"],
        ["lokasi_ditemukan", "string | null", "FOUND only: free-text where item was found"],
        ["lokasi_kemungkinan", "string[] | null", "LOST only: array of probable locations (free-text)"],
        ["lokasi_ditemukan_list", "ItemLocation | null", "FOUND only: structured location enum"],
        ["lokasi_kemungkinan_list", "ItemLocation[] | null", "LOST only: structured location enum array"],
        ["tanggal", "datetime", "Incident date (ISO 8601)"],
        ["expired_at", "datetime | null", "When the item expires (30 days after creation)"],
        ["foto", "ItemFotoOut[]", "Array of photo objects: {id: int, url: string}. Empty for guests on FOUND items."],
    ]))
    story.append(space(6))

    # 4.2 Admin List
    story += section_header("4.2 Admin Full Item List", 2)
    story.append(method_table("GET", "/items/admin/all", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Returns all items with full details including sensitive fields. Supports same query params as 4.1.", "body"))
    story.append(space(3))
    story.append(P("<b>Response 200 OK — Array of ItemOut (full detail):</b>", "body"))
    story.append(response_table([
        ["id", "integer", "Item ID"],
        ["user_id", "integer", "Reporter's user ID"],
        ["tipe", "ItemType", "LOST or FOUND"],
        ["status", "ItemStatus", "Current status"],
        ["kategori", "ItemCategory", "Category"],
        ["nama_publik", "string", "Generic public name"],
        ["deskripsi_detail", "string | null", "Sensitive detail — only visible to admin/owner"],
        ["lokasi_ditemukan", "string | null", "FOUND: where found (free-text)"],
        ["lokasi_sekarang", "IPBLocation | null", "FOUND: current storage location (sensitive)"],
        ["lokasi_kemungkinan", "string[] | null", "LOST: probable locations (free-text)"],
        ["bukti_kepemilikan", "string[] | null", "LOST: URLs of ownership proof photos (sensitive)"],
        ["lokasi_ditemukan_list", "ItemLocation | null", "Structured location for FOUND"],
        ["lokasi_kemungkinan_list", "ItemLocation[] | null", "Structured locations for LOST"],
        ["tanggal", "datetime", "Incident date"],
        ["expired_at", "datetime | null", "Expiry datetime"],
        ["created_at", "datetime", "Record creation time"],
        ["foto", "ItemFotoOut[]", "Photos: [{id, url}]"],
    ]))
    story.append(space(6))

    # 4.3 Item Detail
    story += section_header("4.3 Item Detail", 2)
    story.append(method_table("GET", "/items/{item_id}", auth="Public (optional auth)"))
    story.append(space(3))
    story.append(P("Returns item detail. Response schema depends on caller:", "body"))
    story.append(info_box(
        "• <b>Admin or Owner</b>: Returns full ItemOut (includes deskripsi_detail, lokasi_sekarang, bukti_kepemilikan)\n"
        "• <b>Other authenticated users</b>: Returns ItemOutPublik (sensitive fields hidden)\n"
        "• <b>Guest</b>: Returns ItemOutPublik (photos hidden for FOUND items)"
    ))
    story.append(space(3))
    story.append(P("<b>Path Parameter:</b>", "body"))
    story.append(params_table([["item_id", "integer", "✔ Required", "Unique ID of the item"]]))
    story.append(space(4))

    # 4.4 Create Item
    story += section_header("4.4 Report / Create Item", 2)
    story.append(method_table("POST", "/items", auth="Mahasiswa Only"))
    story.append(space(3))
    story.append(P("Creates a new lost or found item report. "
                   "After creation, the system automatically runs the auto-match engine to find potential matches.", "body"))
    story.append(space(3))
    story.append(P("<b>Request Body (JSON) — ItemCreate:</b>", "body"))
    story.append(params_table([
        ["tipe", "ItemType", "✔ Required", "LOST or FOUND"],
        ["kategori", "ItemCategory", "✔ Required", "Item category"],
        ["nama_publik", "string", "✔ Required", "Generic public name (do NOT include identifying details)"],
        ["deskripsi_detail", "string", "Optional", "Sensitive details only visible to admin/owner"],
        ["tanggal", "datetime", "✔ Required", "Date/time of incident (ISO 8601)"],
        ["lokasi_ditemukan", "string", "Required if FOUND", "Free-text where item was found"],
        ["lokasi_sekarang", "IPBLocation", "Required if FOUND", "Current storage location enum"],
        ["lokasi_ditemukan_list", "ItemLocation", "Optional", "Structured location for FOUND (for matching)"],
        ["lokasi_kemungkinan", "string[]", "Required if LOST", "Array of probable locations (free-text)"],
        ["lokasi_kemungkinan_list", "ItemLocation[]", "Optional", "Structured locations for LOST (for matching)"],
    ]))
    story.append(space(3))
    story.append(P("<b>FOUND Item Example:</b>", "body"))
    story.append(json_block(
        '{\n'
        '  "tipe": "FOUND",\n'
        '  "kategori": "dompet",\n'
        '  "nama_publik": "Dompet Hitam",\n'
        '  "deskripsi_detail": "Dompet kulit hitam berisi KTM dan uang 50rb",\n'
        '  "lokasi_ditemukan": "Dekat parkiran FEM lantai 1",\n'
        '  "lokasi_sekarang": "Pos Satpam FEM",\n'
        '  "lokasi_ditemukan_list": "Fakultas Ekonomi dan Manajemen (FEM)",\n'
        '  "tanggal": "2025-05-30T10:00:00"\n'
        '}'
    ))
    story.append(space(3))
    story.append(P("<b>LOST Item Example:</b>", "body"))
    story.append(json_block(
        '{\n'
        '  "tipe": "LOST",\n'
        '  "kategori": "elektronik",\n'
        '  "nama_publik": "Earphone TWS Putih",\n'
        '  "deskripsi_detail": "TWS merek Samsung Galaxy Buds, case hitam, ada stiker bintang",\n'
        '  "lokasi_kemungkinan": ["Kantin Stevia", "Perpustakaan Pusat"],\n'
        '  "lokasi_kemungkinan_list": ["Kantin Stevia", "Perpustakaan Pusat"],\n'
        '  "tanggal": "2025-05-29T14:30:00"\n'
        '}'
    ))
    story.append(space(3))
    story.append(P("<b>Response 200 OK:</b> Full ItemOut object (see section 4.2 for schema).", "body"))
    story.append(space(6))

    # 4.5 Upload Photo
    story += section_header("4.5 Upload Item Photo", 2)
    story.append(method_table("POST", "/items/{item_id}/foto", auth="Mahasiswa Only (owner)"))
    story.append(space(3))
    story.append(P("Uploads a photo for an item. Only the item's owner can upload.", "body"))
    story.append(space(3))
    story.append(P("<b>Content-Type:</b> multipart/form-data", "body"))
    story.append(params_table([
        ["item_id", "integer (path)", "✔ Required", "Item ID to attach photo to"],
        ["file", "File (form-data)", "✔ Required", "Image file (JPEG, PNG, etc.)"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Full ItemOut with updated foto array.", "body"))
    story.append(space(6))

    # 4.6 Upload Bukti Kepemilikan
    story += section_header("4.6 Upload Ownership Proof", 2)
    story.append(method_table("POST", "/items/{item_id}/bukti-kepemilikan", auth="Mahasiswa Only (owner)"))
    story.append(space(3))
    story.append(P("Uploads ownership proof photo for a LOST item (e.g., photo showing item with owner, receipt, etc.). "
                   "Stored in bukti_kepemilikan field, visible only to admin/owner.", "body"))
    story.append(space(3))
    story.append(P("<b>Content-Type:</b> multipart/form-data", "body"))
    story.append(params_table([
        ["item_id", "integer (path)", "✔ Required", "ID of the LOST item"],
        ["file", "File (form-data)", "✔ Required", "Image file (proof of ownership)"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Full ItemOut with updated bukti_kepemilikan list.", "body"))
    story.append(space(6))

    # 4.7 Delete Item
    story += section_header("4.7 Delete Item", 2)
    story.append(method_table("DELETE", "/items/{item_id}", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Permanently deletes an item and all associated data (claims, matches, photos).", "body"))
    story.append(space(3))
    story.append(params_table([["item_id", "integer (path)", "✔ Required", "ID of the item to delete"]]))
    story.append(space(3))
    story.append(P("<b>Response 200 OK:</b>", "body"))
    story.append(json_block('{"message": "Barang berhasil dihapus"}'))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 5: CLAIMS
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("5. Claims Endpoints  /claims", 1)
    story.append(info_box(
        "A Claim is submitted by a mahasiswa who believes a FOUND item belongs to them. "
        "The claim includes a description of distinguishing features (ciri khusus) and optionally photo evidence. "
        "Admin reviews and either approves or rejects. On approval, a pickup code is generated."
    ))
    story.append(space(4))

    # 5.1
    story += section_header("5.1 Submit Claim", 2)
    story.append(method_table("POST", "/claims", auth="Mahasiswa Only"))
    story.append(space(3))
    story.append(P("Submits a claim for a FOUND item. The mahasiswa must describe unique identifying features "
                   "not visible in the public listing (ciri khusus).", "body"))
    story.append(space(3))
    story.append(P("<b>Request Body (JSON):</b>", "body"))
    story.append(params_table([
        ["item_id", "integer", "✔ Required", "ID of the FOUND item being claimed"],
        ["deskripsi_ciri", "string", "✔ Required", "Description of unique features not visible in public photos"],
    ]))
    story.append(space(3))
    story.append(json_block(
        '{\n'
        '  "item_id": 42,\n'
        '  "deskripsi_ciri": "Di dalam dompet ada kartu ATM BRI atas nama Budi, struk belanja, dan foto keluarga kecil"\n'
        '}'
    ))
    story.append(space(3))
    story.append(P("<b>Response 200 OK — ClaimOut:</b>", "body"))
    story.append(response_table([
        ["id", "integer", "Claim unique ID"],
        ["item_id", "integer", "Item being claimed"],
        ["user_id", "integer", "Claimant's user ID"],
        ["status", "ClaimStatus", "PENDING | APPROVED | REJECTED"],
        ["deskripsi_ciri", "string", "Submitted description of features"],
        ["bukti_foto", "string[]", "URLs of evidence photos"],
        ["created_at", "datetime", "Submission timestamp"],
        ["catatan_admin", "string | null", "Admin's approval/rejection note"],
        ["kode_pengambilan", "string | null", "Pickup code (only set when APPROVED)"],
    ]))
    story.append(space(6))

    # 5.2
    story += section_header("5.2 Upload Claim Evidence Photo", 2)
    story.append(method_table("POST", "/claims/{claim_id}/bukti", auth="Mahasiswa Only (claimant)"))
    story.append(space(3))
    story.append(P("Adds a photo as evidence to support the ownership claim.", "body"))
    story.append(P("<b>Content-Type:</b> multipart/form-data", "body"))
    story.append(params_table([
        ["claim_id", "integer (path)", "✔ Required", "ID of the claim"],
        ["file", "File (form-data)", "✔ Required", "Evidence photo file"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Updated ClaimOut with new photo in bukti_foto array.", "body"))
    story.append(space(6))

    # 5.3
    story += section_header("5.3 Get My Claims", 2)
    story.append(method_table("GET", "/claims/me", auth="Mahasiswa Only"))
    story.append(space(3))
    story.append(P("Returns all claims submitted by the authenticated mahasiswa.", "body"))
    story.append(P("<b>Query Params:</b> skip, limit (see Section 1.5).", "body"))
    story.append(P("<b>Response 200 OK:</b> Array of ClaimOut.", "body"))
    story.append(space(6))

    # 5.4
    story += section_header("5.4 Get All Claims (Admin)", 2)
    story.append(method_table("GET", "/claims", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Returns all claims in the system for admin review.", "body"))
    story.append(P("<b>Query Params:</b> skip, limit (see Section 1.5).", "body"))
    story.append(P("<b>Response 200 OK:</b> Array of ClaimOut.", "body"))
    story.append(space(6))

    # 5.5
    story += section_header("5.5 Approve Claim", 2)
    story.append(method_table("PATCH", "/claims/{claim_id}/approve", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Approves a claim. This action:", "body"))
    story.append(info_box(
        "1. Sets claim status to APPROVED\n"
        "2. Generates a unique 6-character pickup code (kode_pengambilan)\n"
        "3. Sets the item status to CLOSED\n"
        "4. Awards points to the finder (+10 poin)\n"
        "5. Sends notifications to both claimant and item reporter"
    ))
    story.append(space(3))
    story.append(P("<b>Query Parameters:</b>", "body"))
    story.append(params_table([
        ["claim_id", "integer (path)", "✔ Required", "ID of the claim to approve"],
        ["catatan", "string (query)", "Optional", "Admin note for the claimant. Default: empty string"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Updated ClaimOut with status=APPROVED and kode_pengambilan set.", "body"))
    story.append(space(6))

    # 5.6
    story += section_header("5.6 Reject Claim", 2)
    story.append(method_table("PATCH", "/claims/{claim_id}/reject", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Rejects a claim. Item status returns to OPEN.", "body"))
    story.append(params_table([
        ["claim_id", "integer (path)", "✔ Required", "ID of the claim to reject"],
        ["catatan", "string (query)", "Optional", "Reason for rejection shown to claimant. Default: empty string"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Updated ClaimOut with status=REJECTED.", "body"))
    story.append(space(6))

    # 5.7
    story += section_header("5.7 Get Claim Pickup Code", 2)
    story.append(method_table("GET", "/claims/{claim_id}/kode", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Returns the pickup code for an approved claim. Used during physical item handover.", "body"))
    story.append(params_table([["claim_id", "integer (path)", "✔ Required", "ID of the approved claim"]]))
    story.append(space(3))
    story.append(P("<b>Response 200 OK:</b>", "body"))
    story.append(response_table([
        ["claim_id", "integer", "Claim ID"],
        ["nama_barang", "string", "Public name of the claimed item"],
        ["kode_pengambilan", "string | null", "6-character pickup code (null if not yet approved)"],
        ["status", "ClaimStatus", "Current claim status"],
    ]))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 6: FOUND REPORTS
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("6. Found Reports Endpoints  /found-reports", 1)
    story.append(info_box(
        "A Found Report is submitted by a mahasiswa who physically found a lost item that was previously reported. "
        "Unlike a Claim (owner proving ownership), a Found Report is a finder saying 'I found this lost item and "
        "I have it here'. Admin verifies and generates a pickup code for the original item owner."
    ))
    story.append(space(4))

    # 6.1
    story += section_header("6.1 Submit Found Report", 2)
    story.append(method_table("POST", "/found-reports", auth="Mahasiswa Only"))
    story.append(space(3))
    story.append(P("Reports that a LOST item has been found by the submitter. "
                   "Can optionally include a photo. Uses multipart/form-data.", "body"))
    story.append(space(3))
    story.append(P("<b>Content-Type:</b> multipart/form-data", "body"))
    story.append(params_table([
        ["lost_item_id", "integer (form)", "✔ Required", "ID of the LOST item that was found"],
        ["deskripsi", "string (form)", "✔ Required", "Description of how/where the item was found"],
        ["lokasi_sekarang", "IPBLocation (form)", "✔ Required", "Where the item is currently being kept"],
        ["foto", "File (form)", "Optional", "Optional photo evidence of the found item"],
    ]))
    story.append(space(3))
    story.append(P("<b>Response 200 OK — FoundReportOut:</b>", "body"))
    story.append(response_table([
        ["id", "integer", "Report unique ID"],
        ["lost_item_id", "integer", "ID of the referenced LOST item"],
        ["lost_item_nama", "string | null", "Public name of the lost item"],
        ["reporter_id", "integer", "ID of the mahasiswa who found it"],
        ["reporter_nama", "string | null", "Name of the finder"],
        ["deskripsi", "string", "Description submitted by finder"],
        ["lokasi_sekarang", "IPBLocation", "Current storage location"],
        ["foto_bukti", "string[]", "URLs of evidence photos"],
        ["status", "FoundReportStatus", "PENDING | APPROVED | REJECTED"],
        ["catatan_admin", "string | null", "Admin note"],
        ["kode_pengambilan", "string | null", "Pickup code (set on approval)"],
        ["created_at", "datetime", "Submission time"],
    ]))
    story.append(space(6))

    # 6.2
    story += section_header("6.2 Upload Found Report Photo", 2)
    story.append(method_table("POST", "/found-reports/{report_id}/foto", auth="Mahasiswa Only (reporter)"))
    story.append(space(3))
    story.append(P("Adds a photo to an existing found report.", "body"))
    story.append(P("<b>Content-Type:</b> multipart/form-data", "body"))
    story.append(params_table([
        ["report_id", "integer (path)", "✔ Required", "ID of the found report"],
        ["file", "File (form-data)", "✔ Required", "Evidence photo"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Updated FoundReportOut.", "body"))
    story.append(space(6))

    # 6.3
    story += section_header("6.3 Get My Found Reports", 2)
    story.append(method_table("GET", "/found-reports/me", auth="Mahasiswa Only"))
    story.append(space(3))
    story.append(P("Returns all found reports submitted by the authenticated mahasiswa.", "body"))
    story.append(P("<b>Query Params:</b> skip, limit.", "body"))
    story.append(P("<b>Response 200 OK:</b> Array of FoundReportOut.", "body"))
    story.append(space(6))

    # 6.4
    story += section_header("6.4 Get All Pending Found Reports (Admin)", 2)
    story.append(method_table("GET", "/found-reports", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Returns all found reports with status PENDING, for admin review.", "body"))
    story.append(P("<b>Query Params:</b> skip, limit.", "body"))
    story.append(P("<b>Response 200 OK:</b> Array of FoundReportOut.", "body"))
    story.append(space(6))

    # 6.5
    story += section_header("6.5 Get Found Report Pickup Code", 2)
    story.append(method_table("GET", "/found-reports/{report_id}/kode", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Returns the pickup code for an approved found report.", "body"))
    story.append(params_table([["report_id", "integer (path)", "✔ Required", "ID of the found report"]]))
    story.append(space(3))
    story.append(response_table([
        ["report_id", "integer", "Report ID"],
        ["nama_barang", "string", "Name of the found/lost item"],
        ["kode_pengambilan", "string | null", "6-character pickup code (null if not approved)"],
        ["status", "FoundReportStatus", "Current report status"],
    ]))
    story.append(space(6))

    # 6.6
    story += section_header("6.6 Approve Found Report", 2)
    story.append(method_table("PATCH", "/found-reports/{report_id}/approve", auth="Admin Only"))
    story.append(space(3))
    story.append(info_box(
        "Approval actions:\n"
        "1. Sets report status to APPROVED\n"
        "2. Generates a unique pickup code for the item owner\n"
        "3. Sets the LOST item's status to CLOSED\n"
        "4. Awards +10 points to the finder (reporter)\n"
        "5. Sends notification to the item owner and the finder"
    ))
    story.append(space(3))
    story.append(params_table([
        ["report_id", "integer (path)", "✔ Required", "ID of the found report to approve"],
        ["catatan", "string (query)", "Optional", "Admin note. Default: empty string"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Updated FoundReportOut with status=APPROVED.", "body"))
    story.append(space(6))

    # 6.7
    story += section_header("6.7 Reject Found Report", 2)
    story.append(method_table("PATCH", "/found-reports/{report_id}/reject", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Rejects a found report.", "body"))
    story.append(params_table([
        ["report_id", "integer (path)", "✔ Required", "ID of the found report to reject"],
        ["catatan", "string (query)", "Optional", "Rejection reason. Default: empty string"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Updated FoundReportOut with status=REJECTED.", "body"))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 7: MATCHES
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("7. Matches Endpoints  /matches", 1)
    story.append(info_box(
        "The auto-match engine runs automatically every time a new item is reported. "
        "It compares the new item against existing items of the opposite type (FOUND vs LOST) "
        "and scores them based on: same category (+3pts) and overlapping campus location (+2pts). "
        "If score >= 3, a match is created with status PENDING. Admin then reviews and confirms or rejects."
    ))
    story.append(space(4))

    # Match schema
    story.append(P("<b>MatchOut Schema:</b>", "body"))
    story.append(response_table([
        ["id", "integer", "Match unique ID"],
        ["found_item_id", "integer", "ID of the FOUND item"],
        ["lost_item_id", "integer", "ID of the LOST item"],
        ["alasan_match", "string", "System-generated explanation (e.g. 'Kategori sama: dompet | Lokasi berdekatan: FEM')"],
        ["status", "MatchStatus", "PENDING | CONFIRMED | REJECTED"],
        ["catatan_admin", "string | null", "Admin note when confirming/rejecting"],
        ["created_at", "datetime", "When the match was detected"],
    ]))
    story.append(space(6))

    # 7.1
    story += section_header("7.1 List Pending Matches", 2)
    story.append(method_table("GET", "/matches", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Returns all matches with status PENDING, waiting for admin review.", "body"))
    story.append(P("<b>Query Params:</b> skip, limit.", "body"))
    story.append(P("<b>Response 200 OK:</b> Array of MatchOut.", "body"))
    story.append(space(6))

    # 7.2
    story += section_header("7.2 Confirm Match", 2)
    story.append(method_table("PATCH", "/matches/{match_id}/confirm", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Admin confirms that the auto-detected match is correct.", "body"))
    story.append(info_box(
        "Confirmation actions:\n"
        "1. Sets match status to CONFIRMED\n"
        "2. Sets both FOUND and LOST items to CLOSED\n"
        "3. Awards +10 points to the FOUND item reporter (finder)\n"
        "4. Sends notifications to both item owners (found+lost)"
    ))
    story.append(space(3))
    story.append(params_table([
        ["match_id", "integer (path)", "✔ Required", "ID of the match to confirm"],
        ["catatan", "string (query)", "Optional", "Admin note. Default: empty string"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Updated MatchOut with status=CONFIRMED.", "body"))
    story.append(space(6))

    # 7.3
    story += section_header("7.3 Reject Match", 2)
    story.append(method_table("PATCH", "/matches/{match_id}/reject", auth="Admin Only"))
    story.append(space(3))
    story.append(P("Admin rejects the auto-detected match (false positive). Items return to OPEN.", "body"))
    story.append(params_table([
        ["match_id", "integer (path)", "✔ Required", "ID of the match to reject"],
        ["catatan", "string (query)", "Optional", "Rejection reason. Default: empty string"],
    ]))
    story.append(P("<b>Response 200 OK:</b> Updated MatchOut with status=REJECTED.", "body"))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 8: NOTIFICATIONS
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("8. Notifications Endpoints  /notifications", 1)
    story.append(info_box(
        "Notifications are automatically created by the system when important events occur: "
        "claim approved/rejected, found report approved/rejected, match confirmed/rejected. "
        "Each user sees only their own notifications."
    ))
    story.append(space(4))

    story.append(P("<b>NotifOut Schema:</b>", "body"))
    story.append(response_table([
        ["id", "integer", "Notification unique ID"],
        ["judul", "string", "Notification title"],
        ["pesan", "string", "Full notification message"],
        ["is_read", "boolean", "Whether the user has read this notification"],
        ["created_at", "datetime", "When notification was created"],
    ]))
    story.append(space(6))

    # 8.1
    story += section_header("8.1 Get My Notifications", 2)
    story.append(method_table("GET", "/notifications", auth="Any logged-in user"))
    story.append(space(3))
    story.append(P("Returns all notifications for the authenticated user, ordered by newest first.", "body"))
    story.append(P("<b>Query Params:</b> skip, limit.", "body"))
    story.append(P("<b>Response 200 OK:</b> Array of NotifOut.", "body"))
    story.append(space(6))

    # 8.2
    story += section_header("8.2 Mark All Notifications as Read", 2)
    story.append(method_table("PATCH", "/notifications/read", auth="Any logged-in user"))
    story.append(space(3))
    story.append(P("Marks all of the user's notifications as read (is_read = true).", "body"))
    story.append(space(3))
    story.append(P("<b>Response 200 OK:</b>", "body"))
    story.append(json_block('{"message": "Semua notifikasi ditandai sudah dibaca"}'))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 9: LEADERBOARD
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("9. Leaderboard Endpoints  /leaderboard", 1)
    story.append(info_box(
        "The leaderboard ranks mahasiswa by their total points. Points are earned by "
        "reporting found items and having them verified. Anyone (including guests) can view the leaderboard. "
        "Point history is private to each mahasiswa."
    ))
    story.append(space(4))

    # 9.1
    story += section_header("9.1 Get Leaderboard", 2)
    story.append(method_table("GET", "/leaderboard", auth="Public (optional auth)"))
    story.append(space(3))
    story.append(P("Returns the top 10 mahasiswa by points. If authenticated, also returns caller's rank and points.", "body"))
    story.append(space(3))
    story.append(P("<b>Response 200 OK — LeaderboardResponse:</b>", "body"))
    story.append(response_table([
        ["top10", "LeaderboardEntry[]", "Array of top 10 entries"],
        ["top10[].peringkat", "integer", "Rank (1 = highest)"],
        ["top10[].user_id", "integer", "User ID"],
        ["top10[].nama", "string", "User's full name"],
        ["top10[].poin", "integer", "Total points"],
        ["poin_saya", "integer | null", "Caller's total points (null if not authenticated)"],
        ["peringkat_saya", "integer | null", "Caller's rank (null if not authenticated or not ranked)"],
    ]))
    story.append(space(3))
    story.append(P("<b>Response Example:</b>", "body"))
    story.append(json_block(
        '{\n'
        '  "top10": [\n'
        '    {"peringkat": 1, "user_id": 5, "nama": "Siti Rahayu", "poin": 120},\n'
        '    {"peringkat": 2, "user_id": 12, "nama": "Ahmad Fauzi", "poin": 90}\n'
        '  ],\n'
        '  "poin_saya": 45,\n'
        '  "peringkat_saya": 7\n'
        '}'
    ))
    story.append(space(6))

    # 9.2
    story += section_header("9.2 Get My Points History", 2)
    story.append(method_table("GET", "/leaderboard/me/riwayat", auth="Mahasiswa Only"))
    story.append(space(3))
    story.append(P("Returns the authenticated mahasiswa's complete point transaction history.", "body"))
    story.append(space(3))
    story.append(P("<b>Response 200 OK — Array of PointLogOut:</b>", "body"))
    story.append(response_table([
        ["id", "integer", "Log entry ID"],
        ["jumlah", "integer", "Points earned (positive = earned, negative = deducted)"],
        ["alasan", "string", "Reason for the point transaction"],
        ["created_at", "string (datetime)", "When the points were awarded"],
    ]))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 10: DATA MODELS
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("10. Data Models Reference", 1)
    story.append(P("Complete database entity definitions for reference.", "body"))
    story.append(space(4))

    # User
    story += section_header("10.1 User", 2)
    story.append(response_table([
        ["id", "integer (PK)", "Auto-incrementing primary key"],
        ["username", "string (unique)", "Login identifier"],
        ["nim", "string (unique, nullable)", "Student ID number (null for admins)"],
        ["nama", "string", "Full display name"],
        ["email", "string (unique)", "Email address"],
        ["password", "string", "Bcrypt-hashed password (never returned in API)"],
        ["role", "UserRole", "mahasiswa or admin"],
        ["is_active", "boolean", "Account active status. Default: true"],
        ["poin", "integer", "Accumulated points. Default: 0"],
        ["created_at", "datetime", "Account creation timestamp"],
    ]))
    story.append(space(6))

    # Item
    story += section_header("10.2 Item", 2)
    story.append(response_table([
        ["id", "integer (PK)", "Primary key"],
        ["user_id", "integer (FK → users)", "Reporter's user ID"],
        ["tipe", "ItemType", "LOST or FOUND"],
        ["status", "ItemStatus", "OPEN | PENDING | CLOSED | EXPIRED. Default: OPEN"],
        ["kategori", "ItemCategory", "Item category"],
        ["nama_publik", "string", "Generic public name"],
        ["deskripsi_detail", "text (nullable)", "Sensitive details (admin/owner only)"],
        ["lokasi_ditemukan", "string (nullable)", "FOUND: free-text location where found"],
        ["lokasi_sekarang", "IPBLocation (nullable)", "FOUND: current storage location"],
        ["lokasi_ditemukan_list", "ItemLocation (nullable)", "FOUND: structured location enum"],
        ["lokasi_kemungkinan", "string[] (nullable)", "LOST: array of probable locations (free-text)"],
        ["lokasi_kemungkinan_list", "ItemLocation[] (nullable)", "LOST: structured location enum array"],
        ["bukti_kepemilikan", "string[] (nullable)", "LOST: ownership proof photo URLs"],
        ["tanggal", "datetime", "Incident date/time"],
        ["expired_at", "datetime", "Expiry time. Auto-set to created_at + 30 days"],
        ["created_at", "datetime", "Record creation time"],
    ]))
    story.append(space(6))

    # Claim
    story += section_header("10.3 Claim", 2)
    story.append(response_table([
        ["id", "integer (PK)", "Primary key"],
        ["item_id", "integer (FK → items)", "The FOUND item being claimed"],
        ["user_id", "integer (FK → users)", "The mahasiswa submitting the claim"],
        ["status", "ClaimStatus", "PENDING | APPROVED | REJECTED. Default: PENDING"],
        ["deskripsi_ciri", "text", "Description of unique identifying features"],
        ["bukti_foto", "string[]", "Array of evidence photo URLs. Default: []"],
        ["catatan_admin", "text (nullable)", "Admin's approval/rejection note"],
        ["kode_pengambilan", "string (nullable)", "6-char pickup code, set on approval"],
        ["created_at", "datetime", "Submission time"],
        ["updated_at", "datetime (nullable)", "Last modification time"],
    ]))
    story.append(space(6))

    # FoundReport
    story += section_header("10.4 FoundReport", 2)
    story.append(response_table([
        ["id", "integer (PK)", "Primary key"],
        ["lost_item_id", "integer (FK → items)", "The LOST item that was found"],
        ["reporter_id", "integer (FK → users)", "The mahasiswa who found it"],
        ["deskripsi", "text", "How/where the item was found"],
        ["lokasi_sekarang", "IPBLocation", "Where the item is currently stored"],
        ["foto_bukti", "string[]", "Evidence photo URLs. Default: []"],
        ["status", "FoundReportStatus", "PENDING | APPROVED | REJECTED. Default: PENDING"],
        ["catatan_admin", "text (nullable)", "Admin note"],
        ["kode_pengambilan", "string (nullable)", "Pickup code for item owner, set on approval"],
        ["created_at", "datetime", "Submission time"],
    ]))
    story.append(space(6))

    # ItemMatch
    story += section_header("10.5 ItemMatch", 2)
    story.append(response_table([
        ["id", "integer (PK)", "Primary key"],
        ["found_item_id", "integer (FK → items)", "The FOUND item in the match pair"],
        ["lost_item_id", "integer (FK → items)", "The LOST item in the match pair"],
        ["alasan_match", "text", "System explanation: why this match was detected"],
        ["status", "MatchStatus", "PENDING | CONFIRMED | REJECTED. Default: PENDING"],
        ["catatan_admin", "text (nullable)", "Admin note on confirm/reject"],
        ["created_at", "datetime", "When the match was auto-detected"],
    ]))
    story.append(space(6))

    # Notification
    story += section_header("10.6 Notification", 2)
    story.append(response_table([
        ["id", "integer (PK)", "Primary key"],
        ["user_id", "integer (FK → users)", "Recipient user ID"],
        ["judul", "string", "Short notification title"],
        ["pesan", "text", "Full notification message"],
        ["is_read", "boolean", "Read status. Default: false"],
        ["created_at", "datetime", "Creation timestamp"],
    ]))
    story.append(space(6))

    # PointLog
    story += section_header("10.7 PointLog", 2)
    story.append(response_table([
        ["id", "integer (PK)", "Primary key"],
        ["user_id", "integer (FK → users)", "User who earned/lost points"],
        ["jumlah", "integer", "Point delta: positive=earned, negative=deducted"],
        ["alasan", "string", "Human-readable reason for the transaction"],
        ["created_at", "datetime", "Transaction timestamp"],
    ]))
    story.append(PageBreak())

    # ═══════════════════════════════════════════════════════════════════════
    # SECTION 11: BUSINESS LOGIC
    # ═══════════════════════════════════════════════════════════════════════
    story += section_header("11. Business Logic & Rules", 1)

    # 11.1 Points
    story += section_header("11.1 Points System", 2)
    story.append(info_box(
        "Points incentivize students to report and return found items. "
        "Points are awarded automatically when admin approves claims/reports or confirms matches."
    ))
    story.append(space(3))
    pts_data = [
        [P("Event", "cell_bold"), P("Who Earns", "cell_bold"), P("Points", "cell_bold")],
        [P("Claim APPROVED", "cell"),
         P("Finder (reporter of the FOUND item)", "cell"),
         P("+10 poin", "cell")],
        [P("Found Report APPROVED", "cell"),
         P("Reporter (mahasiswa who found and submitted the report)", "cell"),
         P("+10 poin", "cell")],
        [P("Match CONFIRMED", "cell"),
         P("Finder (reporter of the FOUND item in the match)", "cell"),
         P("+10 poin", "cell")],
    ]
    pts_t = Table(pts_data, colWidths=[5*cm, 7*cm, 4*cm])
    pts_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TABLE_HEADER),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [ROW_WHITE, ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("PADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ]))
    story.append(pts_t)
    story.append(space(6))

    # 11.2 Auto-Match
    story += section_header("11.2 Auto-Match Engine", 2)
    story.append(P("Triggered automatically when a new item is created (POST /items).", "body"))
    story.append(space(3))
    match_data = [
        [P("Condition", "cell_bold"), P("Score Added", "cell_bold")],
        [P("Same kategori (category)", "cell"), P("+3 points", "cell")],
        [P("Overlapping ItemLocation (lokasi_ditemukan_list / lokasi_kemungkinan_list)", "cell"), P("+2 points", "cell")],
        [P("Match created if total score >= 3", "cell"), P("→ ItemMatch with status=PENDING", "cell")],
    ]
    match_t = Table(match_data, colWidths=[11*cm, 5*cm])
    match_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TABLE_HEADER),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [ROW_WHITE, ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("PADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ]))
    story.append(match_t)
    story.append(space(3))
    story.append(P("<b>alasan_match example:</b> \"Kategori sama: dompet | Lokasi berdekatan: Fakultas Ekonomi dan Manajemen (FEM)\"", "body"))
    story.append(space(6))

    # 11.3 Expiry
    story += section_header("11.3 Item Expiry", 2)
    story.append(P("A background scheduler runs every 24 hours (APScheduler) and marks items as EXPIRED "
                   "if they have not been resolved and the current time has passed expired_at.", "body"))
    story.append(space(3))
    story.append(info_box(
        "• expired_at is automatically set to created_at + 30 days when the item is created.\n"
        "• Items with status CLOSED are never expired.\n"
        "• Expired items remain in the database but are filtered out of active searches by default.\n"
        "• expired_at is visible in both ItemOut and ItemOutPublik for frontend countdown display."
    ))
    story.append(space(6))

    # 11.4 Pickup Codes
    story += section_header("11.4 Pickup Codes (kode_pengambilan)", 2)
    story.append(P("A pickup code is a 6-character alphanumeric token generated when an admin approves "
                   "a Claim or Found Report. It serves as a physical handover verification mechanism.", "body"))
    story.append(space(3))
    story.append(info_box(
        "• Generated using: secrets.token_hex(3).upper() → e.g. 'A3F9C2'\n"
        "• The code is given to the item owner (claimant) via notification.\n"
        "• The finder/admin presents this code when physically handing over the item.\n"
        "• Admin can retrieve the code anytime via GET /claims/{id}/kode or GET /found-reports/{id}/kode.\n"
        "• The code is stored in the claim/found_report record and never changes after generation."
    ))
    story.append(space(6))

    # Final summary table
    story += section_header("Quick Reference — All Endpoints", 1)
    summary = [
        [P("Method", "cell_bold"), P("Endpoint", "cell_bold"),
         P("Auth", "cell_bold"), P("Description", "cell_bold")],
        # Auth
        [P("POST", "cell"), P("/auth/login", "cell_code"), P("Public", "cell"), P("Login → get JWT", "cell")],
        [P("GET", "cell"), P("/auth/me", "cell_code"), P("Any user", "cell"), P("Get own profile", "cell")],
        # Items
        [P("GET", "cell"), P("/items", "cell_code"), P("Public", "cell"), P("List items with filters", "cell")],
        [P("GET", "cell"), P("/items/admin/all", "cell_code"), P("Admin", "cell"), P("All items (full detail)", "cell")],
        [P("GET", "cell"), P("/items/{item_id}", "cell_code"), P("Public", "cell"), P("Item detail", "cell")],
        [P("POST", "cell"), P("/items", "cell_code"), P("Mahasiswa", "cell"), P("Report lost/found item", "cell")],
        [P("POST", "cell"), P("/items/{item_id}/foto", "cell_code"), P("Mahasiswa", "cell"), P("Upload item photo", "cell")],
        [P("POST", "cell"), P("/items/{item_id}/bukti-kepemilikan", "cell_code"), P("Mahasiswa", "cell"), P("Upload ownership proof", "cell")],
        [P("DELETE", "cell"), P("/items/{item_id}", "cell_code"), P("Admin", "cell"), P("Delete item", "cell")],
        # Claims
        [P("POST", "cell"), P("/claims", "cell_code"), P("Mahasiswa", "cell"), P("Submit claim", "cell")],
        [P("POST", "cell"), P("/claims/{claim_id}/bukti", "cell_code"), P("Mahasiswa", "cell"), P("Upload claim evidence", "cell")],
        [P("GET", "cell"), P("/claims/me", "cell_code"), P("Mahasiswa", "cell"), P("My claims", "cell")],
        [P("GET", "cell"), P("/claims", "cell_code"), P("Admin", "cell"), P("All claims", "cell")],
        [P("PATCH", "cell"), P("/claims/{claim_id}/approve", "cell_code"), P("Admin", "cell"), P("Approve claim", "cell")],
        [P("PATCH", "cell"), P("/claims/{claim_id}/reject", "cell_code"), P("Admin", "cell"), P("Reject claim", "cell")],
        [P("GET", "cell"), P("/claims/{claim_id}/kode", "cell_code"), P("Admin", "cell"), P("Get pickup code", "cell")],
        # Found Reports
        [P("POST", "cell"), P("/found-reports", "cell_code"), P("Mahasiswa", "cell"), P("Submit found report (multipart)", "cell")],
        [P("POST", "cell"), P("/found-reports/{report_id}/foto", "cell_code"), P("Mahasiswa", "cell"), P("Upload evidence photo", "cell")],
        [P("GET", "cell"), P("/found-reports/me", "cell_code"), P("Mahasiswa", "cell"), P("My found reports", "cell")],
        [P("GET", "cell"), P("/found-reports", "cell_code"), P("Admin", "cell"), P("All pending found reports", "cell")],
        [P("GET", "cell"), P("/found-reports/{report_id}/kode", "cell_code"), P("Admin", "cell"), P("Get pickup code", "cell")],
        [P("PATCH", "cell"), P("/found-reports/{report_id}/approve", "cell_code"), P("Admin", "cell"), P("Approve found report", "cell")],
        [P("PATCH", "cell"), P("/found-reports/{report_id}/reject", "cell_code"), P("Admin", "cell"), P("Reject found report", "cell")],
        # Matches
        [P("GET", "cell"), P("/matches", "cell_code"), P("Admin", "cell"), P("List pending matches", "cell")],
        [P("PATCH", "cell"), P("/matches/{match_id}/confirm", "cell_code"), P("Admin", "cell"), P("Confirm match", "cell")],
        [P("PATCH", "cell"), P("/matches/{match_id}/reject", "cell_code"), P("Admin", "cell"), P("Reject match", "cell")],
        # Notifications
        [P("GET", "cell"), P("/notifications", "cell_code"), P("Any user", "cell"), P("Get notifications", "cell")],
        [P("PATCH", "cell"), P("/notifications/read", "cell_code"), P("Any user", "cell"), P("Mark all as read", "cell")],
        # Leaderboard
        [P("GET", "cell"), P("/leaderboard", "cell_code"), P("Public", "cell"), P("Top 10 leaderboard", "cell")],
        [P("GET", "cell"), P("/leaderboard/me/riwayat", "cell_code"), P("Mahasiswa", "cell"), P("My points history", "cell")],
    ]

    # Color methods in quick reference
    def method_color_for(text_str):
        m = text_str
        if "POST" in str(m): return colors.HexColor("#E8F5E9")
        if "DELETE" in str(m): return colors.HexColor("#FFEBEE")
        if "PATCH" in str(m): return colors.HexColor("#FFF3E0")
        return colors.HexColor("#E3F2FD")

    sum_t = Table(summary, colWidths=[1.5*cm, 6*cm, 2.5*cm, 6*cm], repeatRows=1)
    sum_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TABLE_HEADER),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [ROW_WHITE, ROW_ALT]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER_COLOR),
        ("PADDING", (0,0), (-1,-1), 5),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("FONTSIZE", (0,0), (-1,-1), 8.5),
    ]))
    story.append(sum_t)

    story.append(space(10))
    story.append(HR(BRAND_GREEN, 1))
    story.append(P("End of API Contract — IPB Lost &amp; Found System v1.0.0", "note"))
    story.append(P(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M WIB')} | For questions, contact the development team.", "note"))

    # ── PAGE NUMBERING ────────────────────────────────────────────────────────
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(ACCENT_GREY)
        canvas.drawString(2*cm, 1.2*cm, "IPB Lost & Found — API Contract v1.0")
        canvas.drawRightString(A4[0] - 2*cm, 1.2*cm, f"Page {doc.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"[OK] API Contract generated: {out}")

if __name__ == "__main__":
    build()
