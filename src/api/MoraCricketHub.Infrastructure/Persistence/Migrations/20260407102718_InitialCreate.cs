using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoraCricketHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Opponents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ShortName = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Opponents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Players",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ShortName = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Nickname = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    PhotoUrl = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Faculty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Degree = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BatchYear = table.Column<int>(type: "integer", nullable: false),
                    BattingStyle = table.Column<string>(type: "text", nullable: false),
                    PrimaryBowlingStyle = table.Column<string>(type: "text", nullable: true),
                    DebutDate = table.Column<DateOnly>(type: "date", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Players", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Seasons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Seasons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Venues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsMoraHomeGround = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Venues", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OpponentPlayers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OpponentId = table.Column<Guid>(type: "uuid", nullable: true),
                    FullName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BattingStyle = table.Column<string>(type: "text", nullable: true),
                    BowlingStyle = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpponentPlayers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpponentPlayers_Opponents_OpponentId",
                        column: x => x.OpponentId,
                        principalTable: "Opponents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PlayerSeasons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    SeasonId = table.Column<Guid>(type: "uuid", nullable: false),
                    JerseyNumber = table.Column<int>(type: "integer", nullable: true),
                    BattingRole = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerSeasons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerSeasons_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlayerSeasons_Seasons_SeasonId",
                        column: x => x.SeasonId,
                        principalTable: "Seasons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tournaments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SeasonId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Format = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    OversPerSide = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tournaments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tournaments_Seasons_SeasonId",
                        column: x => x.SeasonId,
                        principalTable: "Seasons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TournamentId = table.Column<Guid>(type: "uuid", nullable: false),
                    OpponentId = table.Column<Guid>(type: "uuid", nullable: false),
                    VenueId = table.Column<Guid>(type: "uuid", nullable: true),
                    MatchDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ScheduledOvers = table.Column<int>(type: "integer", nullable: false),
                    VenueType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    SurfaceType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    BallColour = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    BallType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    RoundType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RoundLabel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TossHeld = table.Column<bool>(type: "boolean", nullable: false),
                    TossWinner = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    TossDecision = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    MoraBattingFirst = table.Column<bool>(type: "boolean", nullable: true),
                    Status = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    ResultType = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    ResultMargin = table.Column<int>(type: "integer", nullable: true),
                    ResultMarginType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    DlsApplied = table.Column<bool>(type: "boolean", nullable: false),
                    DlsTarget = table.Column<int>(type: "integer", nullable: true),
                    RevisedOvers = table.Column<int>(type: "integer", nullable: true),
                    MoraCaptainId = table.Column<Guid>(type: "uuid", nullable: true),
                    MoraWickeeperId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpponentCaptainName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PlayerOfMatchMoraId = table.Column<Guid>(type: "uuid", nullable: true),
                    PlayerOfMatchName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PlayerOfMatchTeam = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Matches_Opponents_OpponentId",
                        column: x => x.OpponentId,
                        principalTable: "Opponents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matches_Players_MoraCaptainId",
                        column: x => x.MoraCaptainId,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Matches_Players_MoraWickeeperId",
                        column: x => x.MoraWickeeperId,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Matches_Players_PlayerOfMatchMoraId",
                        column: x => x.PlayerOfMatchMoraId,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Matches_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matches_Venues_VenueId",
                        column: x => x.VenueId,
                        principalTable: "Venues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Innings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsNumber = table.Column<int>(type: "integer", nullable: false),
                    InningsType = table.Column<string>(type: "text", nullable: false),
                    BattingTeam = table.Column<string>(type: "text", nullable: false),
                    MoraWickeeperId = table.Column<Guid>(type: "uuid", nullable: true),
                    TotalRuns = table.Column<int>(type: "integer", nullable: false),
                    TotalWickets = table.Column<int>(type: "integer", nullable: false),
                    TotalOversFaced = table.Column<decimal>(type: "numeric(4,1)", nullable: false),
                    ExtrasWides = table.Column<int>(type: "integer", nullable: false),
                    ExtrasNoBalls = table.Column<int>(type: "integer", nullable: false),
                    ExtrasLegByes = table.Column<int>(type: "integer", nullable: false),
                    ExtrasByes = table.Column<int>(type: "integer", nullable: false),
                    ExtrasPenalty = table.Column<int>(type: "integer", nullable: false),
                    HasDeliveryData = table.Column<bool>(type: "boolean", nullable: false),
                    CommentaryCoverage = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Innings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Innings_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Innings_Players_MoraWickeeperId",
                        column: x => x.MoraWickeeperId,
                        principalTable: "Players",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MatchSquads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsPlayingXi = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchSquads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchSquads_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchSquads_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerMilestones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    MilestoneType = table.Column<string>(type: "text", nullable: false),
                    MatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    AchievedAt = table.Column<DateOnly>(type: "date", nullable: false),
                    Detail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerMilestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerMilestones_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerMilestones_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Deliveries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    OverNumber = table.Column<int>(type: "integer", nullable: false),
                    BallNumber = table.Column<int>(type: "integer", nullable: false),
                    DeliverySequence = table.Column<int>(type: "integer", nullable: false),
                    MoraBatterId = table.Column<Guid>(type: "uuid", nullable: true),
                    OppBatterId = table.Column<Guid>(type: "uuid", nullable: true),
                    OppBatterName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OppBatterStyle = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    MoraBowlerId = table.Column<Guid>(type: "uuid", nullable: true),
                    OppBowlerId = table.Column<Guid>(type: "uuid", nullable: true),
                    OppBowlerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OppBowlerStyle = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    RunsOffBat = table.Column<int>(type: "integer", nullable: false),
                    ExtrasType = table.Column<string>(type: "text", nullable: true),
                    ExtrasRuns = table.Column<int>(type: "integer", nullable: false),
                    TotalRuns = table.Column<int>(type: "integer", nullable: false),
                    IsWicket = table.Column<bool>(type: "boolean", nullable: false),
                    WicketType = table.Column<string>(type: "text", nullable: true),
                    DismissedMoraBatterId = table.Column<Guid>(type: "uuid", nullable: true),
                    DismissedOppBatterId = table.Column<Guid>(type: "uuid", nullable: true),
                    DismissedBatterName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MoraFielderId = table.Column<Guid>(type: "uuid", nullable: true),
                    OppFielderName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BowlingSide = table.Column<string>(type: "text", nullable: true),
                    ShotType = table.Column<string>(type: "text", nullable: true),
                    DirectionZone = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deliveries_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Deliveries_OpponentPlayers_DismissedOppBatterId",
                        column: x => x.DismissedOppBatterId,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Deliveries_OpponentPlayers_OppBatterId",
                        column: x => x.OppBatterId,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Deliveries_OpponentPlayers_OppBowlerId",
                        column: x => x.OppBowlerId,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Deliveries_Players_DismissedMoraBatterId",
                        column: x => x.DismissedMoraBatterId,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Deliveries_Players_MoraBatterId",
                        column: x => x.MoraBatterId,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Deliveries_Players_MoraBowlerId",
                        column: x => x.MoraBowlerId,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Deliveries_Players_MoraFielderId",
                        column: x => x.MoraFielderId,
                        principalTable: "Players",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FallOfWickets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    WicketNumber = table.Column<int>(type: "integer", nullable: false),
                    ScoreAtFall = table.Column<int>(type: "integer", nullable: false),
                    OverAtFall = table.Column<decimal>(type: "numeric(4,1)", nullable: false),
                    DismissedMoraPlayerId = table.Column<Guid>(type: "uuid", nullable: true),
                    DismissedOppPlayerId = table.Column<Guid>(type: "uuid", nullable: true),
                    DismissedPlayerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FallOfWickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FallOfWickets_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FallOfWickets_OpponentPlayers_DismissedOppPlayerId",
                        column: x => x.DismissedOppPlayerId,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FallOfWickets_Players_DismissedMoraPlayerId",
                        column: x => x.DismissedMoraPlayerId,
                        principalTable: "Players",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MoraBattingOrders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoraBattingOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MoraBattingOrders_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MoraBattingOrders_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MoraBattingPerformances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    BattingPosition = table.Column<int>(type: "integer", nullable: false),
                    Runs = table.Column<int>(type: "integer", nullable: false),
                    BallsFaced = table.Column<int>(type: "integer", nullable: false),
                    Fours = table.Column<int>(type: "integer", nullable: false),
                    Sixes = table.Column<int>(type: "integer", nullable: false),
                    IsNotOut = table.Column<bool>(type: "boolean", nullable: false),
                    MinutesBatted = table.Column<int>(type: "integer", nullable: true),
                    DismissalType = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    DismissedByOppBowlerId = table.Column<Guid>(type: "uuid", nullable: true),
                    DismissedByOppBowlerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DismissedByOppBowlerStyle = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    FieldedByMoraPlayerId = table.Column<Guid>(type: "uuid", nullable: true),
                    FieldedByOppName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsThirty = table.Column<bool>(type: "boolean", nullable: false),
                    IsFifty = table.Column<bool>(type: "boolean", nullable: false),
                    IsHundred = table.Column<bool>(type: "boolean", nullable: false),
                    IsDuck = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoraBattingPerformances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MoraBattingPerformances_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MoraBattingPerformances_OpponentPlayers_DismissedByOppBowle~",
                        column: x => x.DismissedByOppBowlerId,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MoraBattingPerformances_Players_FieldedByMoraPlayerId",
                        column: x => x.FieldedByMoraPlayerId,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MoraBattingPerformances_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MoraBowlingPerformances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    OversBowled = table.Column<decimal>(type: "numeric(4,1)", nullable: false),
                    Maidens = table.Column<int>(type: "integer", nullable: false),
                    RunsConceded = table.Column<int>(type: "integer", nullable: false),
                    Wickets = table.Column<int>(type: "integer", nullable: false),
                    Wides = table.Column<int>(type: "integer", nullable: false),
                    NoBalls = table.Column<int>(type: "integer", nullable: false),
                    IsFourWicketHaul = table.Column<bool>(type: "boolean", nullable: false),
                    IsFiveWicketHaul = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoraBowlingPerformances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MoraBowlingPerformances_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MoraBowlingPerformances_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MoraFieldingPerformances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Catches = table.Column<int>(type: "integer", nullable: false),
                    RunOuts = table.Column<int>(type: "integer", nullable: false),
                    Stumpings = table.Column<int>(type: "integer", nullable: false),
                    DroppedCatches = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MoraFieldingPerformances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MoraFieldingPerformances_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MoraFieldingPerformances_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OpponentBattingPerformances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    OpponentPlayerId = table.Column<Guid>(type: "uuid", nullable: true),
                    PlayerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BattingStyle = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    BattingPosition = table.Column<int>(type: "integer", nullable: false),
                    Runs = table.Column<int>(type: "integer", nullable: false),
                    BallsFaced = table.Column<int>(type: "integer", nullable: false),
                    Fours = table.Column<int>(type: "integer", nullable: false),
                    Sixes = table.Column<int>(type: "integer", nullable: false),
                    IsNotOut = table.Column<bool>(type: "boolean", nullable: false),
                    MinutesBatted = table.Column<int>(type: "integer", nullable: true),
                    DismissalType = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    DismissedByMoraBowlerId = table.Column<Guid>(type: "uuid", nullable: true),
                    FieldedByMoraPlayerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpponentBattingPerformances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpponentBattingPerformances_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OpponentBattingPerformances_OpponentPlayers_OpponentPlayerId",
                        column: x => x.OpponentPlayerId,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_OpponentBattingPerformances_Players_DismissedByMoraBowlerId",
                        column: x => x.DismissedByMoraBowlerId,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OpponentBattingPerformances_Players_FieldedByMoraPlayerId",
                        column: x => x.FieldedByMoraPlayerId,
                        principalTable: "Players",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OpponentBowlingPerformances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    OpponentPlayerId = table.Column<Guid>(type: "uuid", nullable: true),
                    PlayerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BowlingStyle = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    OversBowled = table.Column<decimal>(type: "numeric(4,1)", nullable: false),
                    Maidens = table.Column<int>(type: "integer", nullable: false),
                    RunsConceded = table.Column<int>(type: "integer", nullable: false),
                    Wickets = table.Column<int>(type: "integer", nullable: false),
                    Wides = table.Column<int>(type: "integer", nullable: false),
                    NoBalls = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpponentBowlingPerformances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpponentBowlingPerformances_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OpponentBowlingPerformances_OpponentPlayers_OpponentPlayerId",
                        column: x => x.OpponentPlayerId,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "OverSummaries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    OverNumber = table.Column<int>(type: "integer", nullable: false),
                    RunsInOver = table.Column<int>(type: "integer", nullable: false),
                    WicketsInOver = table.Column<int>(type: "integer", nullable: false),
                    DotsInOver = table.Column<int>(type: "integer", nullable: false),
                    FoursInOver = table.Column<int>(type: "integer", nullable: false),
                    SixesInOver = table.Column<int>(type: "integer", nullable: false),
                    WidesInOver = table.Column<int>(type: "integer", nullable: false),
                    NoBallsInOver = table.Column<int>(type: "integer", nullable: false),
                    CumulativeRuns = table.Column<int>(type: "integer", nullable: false),
                    CumulativeWickets = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OverSummaries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OverSummaries_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Partnerships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    WicketNumber = table.Column<int>(type: "integer", nullable: false),
                    MoraBatter1Id = table.Column<Guid>(type: "uuid", nullable: true),
                    MoraBatter2Id = table.Column<Guid>(type: "uuid", nullable: true),
                    OppBatter1Id = table.Column<Guid>(type: "uuid", nullable: true),
                    OppBatter1Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OppBatter2Id = table.Column<Guid>(type: "uuid", nullable: true),
                    OppBatter2Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Runs = table.Column<int>(type: "integer", nullable: false),
                    Balls = table.Column<int>(type: "integer", nullable: false),
                    Batter1Runs = table.Column<int>(type: "integer", nullable: false),
                    Batter2Runs = table.Column<int>(type: "integer", nullable: false),
                    Unbroken = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partnerships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Partnerships_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Partnerships_OpponentPlayers_OppBatter1Id",
                        column: x => x.OppBatter1Id,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Partnerships_OpponentPlayers_OppBatter2Id",
                        column: x => x.OppBatter2Id,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Partnerships_Players_MoraBatter1Id",
                        column: x => x.MoraBatter1Id,
                        principalTable: "Players",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Partnerships_Players_MoraBatter2Id",
                        column: x => x.MoraBatter2Id,
                        principalTable: "Players",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BowlingMilestones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    MilestoneType = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    Delivery1Id = table.Column<Guid>(type: "uuid", nullable: true),
                    Delivery2Id = table.Column<Guid>(type: "uuid", nullable: true),
                    Delivery3Id = table.Column<Guid>(type: "uuid", nullable: true),
                    Detail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BowlingMilestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BowlingMilestones_Deliveries_Delivery1Id",
                        column: x => x.Delivery1Id,
                        principalTable: "Deliveries",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BowlingMilestones_Deliveries_Delivery2Id",
                        column: x => x.Delivery2Id,
                        principalTable: "Deliveries",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BowlingMilestones_Deliveries_Delivery3Id",
                        column: x => x.Delivery3Id,
                        principalTable: "Deliveries",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BowlingMilestones_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BowlingMilestones_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BowlingMilestones_Delivery1Id",
                table: "BowlingMilestones",
                column: "Delivery1Id");

            migrationBuilder.CreateIndex(
                name: "IX_BowlingMilestones_Delivery2Id",
                table: "BowlingMilestones",
                column: "Delivery2Id");

            migrationBuilder.CreateIndex(
                name: "IX_BowlingMilestones_Delivery3Id",
                table: "BowlingMilestones",
                column: "Delivery3Id");

            migrationBuilder.CreateIndex(
                name: "IX_BowlingMilestones_InningsId",
                table: "BowlingMilestones",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_BowlingMilestones_MilestoneType",
                table: "BowlingMilestones",
                column: "MilestoneType");

            migrationBuilder.CreateIndex(
                name: "IX_BowlingMilestones_PlayerId",
                table: "BowlingMilestones",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_DismissedMoraBatterId",
                table: "Deliveries",
                column: "DismissedMoraBatterId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_DismissedOppBatterId",
                table: "Deliveries",
                column: "DismissedOppBatterId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_InningsId",
                table: "Deliveries",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_InningsId_OverNumber_DeliverySequence",
                table: "Deliveries",
                columns: new[] { "InningsId", "OverNumber", "DeliverySequence" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_IsWicket",
                table: "Deliveries",
                column: "IsWicket");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_MoraBatterId",
                table: "Deliveries",
                column: "MoraBatterId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_MoraBowlerId",
                table: "Deliveries",
                column: "MoraBowlerId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_MoraFielderId",
                table: "Deliveries",
                column: "MoraFielderId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_OppBatterId",
                table: "Deliveries",
                column: "OppBatterId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_OppBatterStyle",
                table: "Deliveries",
                column: "OppBatterStyle");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_OppBowlerId",
                table: "Deliveries",
                column: "OppBowlerId");

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_OppBowlerStyle",
                table: "Deliveries",
                column: "OppBowlerStyle");

            migrationBuilder.CreateIndex(
                name: "IX_FallOfWickets_DismissedMoraPlayerId",
                table: "FallOfWickets",
                column: "DismissedMoraPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_FallOfWickets_DismissedOppPlayerId",
                table: "FallOfWickets",
                column: "DismissedOppPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_FallOfWickets_InningsId",
                table: "FallOfWickets",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_FallOfWickets_InningsId_WicketNumber",
                table: "FallOfWickets",
                columns: new[] { "InningsId", "WicketNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Innings_BattingTeam",
                table: "Innings",
                column: "BattingTeam");

            migrationBuilder.CreateIndex(
                name: "IX_Innings_HasDeliveryData",
                table: "Innings",
                column: "HasDeliveryData");

            migrationBuilder.CreateIndex(
                name: "IX_Innings_MatchId",
                table: "Innings",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Innings_MoraWickeeperId",
                table: "Innings",
                column: "MoraWickeeperId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_MatchDate",
                table: "Matches",
                column: "MatchDate");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_MoraBattingFirst",
                table: "Matches",
                column: "MoraBattingFirst");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_MoraCaptainId",
                table: "Matches",
                column: "MoraCaptainId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_MoraWickeeperId",
                table: "Matches",
                column: "MoraWickeeperId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_OpponentId",
                table: "Matches",
                column: "OpponentId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_PlayerOfMatchMoraId",
                table: "Matches",
                column: "PlayerOfMatchMoraId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_ResultType",
                table: "Matches",
                column: "ResultType");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_Status",
                table: "Matches",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_TournamentId",
                table: "Matches",
                column: "TournamentId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_VenueId",
                table: "Matches",
                column: "VenueId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_VenueType",
                table: "Matches",
                column: "VenueType");

            migrationBuilder.CreateIndex(
                name: "IX_MatchSquads_MatchId_PlayerId",
                table: "MatchSquads",
                columns: new[] { "MatchId", "PlayerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MatchSquads_PlayerId",
                table: "MatchSquads",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBattingOrders_InningsId_PlayerId",
                table: "MoraBattingOrders",
                columns: new[] { "InningsId", "PlayerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MoraBattingOrders_InningsId_Position",
                table: "MoraBattingOrders",
                columns: new[] { "InningsId", "Position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MoraBattingOrders_PlayerId",
                table: "MoraBattingOrders",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBattingPerformances_DismissedByOppBowlerId",
                table: "MoraBattingPerformances",
                column: "DismissedByOppBowlerId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBattingPerformances_DismissedByOppBowlerStyle",
                table: "MoraBattingPerformances",
                column: "DismissedByOppBowlerStyle");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBattingPerformances_FieldedByMoraPlayerId",
                table: "MoraBattingPerformances",
                column: "FieldedByMoraPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBattingPerformances_InningsId",
                table: "MoraBattingPerformances",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBattingPerformances_PlayerId",
                table: "MoraBattingPerformances",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBowlingPerformances_InningsId",
                table: "MoraBowlingPerformances",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBowlingPerformances_IsFiveWicketHaul",
                table: "MoraBowlingPerformances",
                column: "IsFiveWicketHaul");

            migrationBuilder.CreateIndex(
                name: "IX_MoraBowlingPerformances_PlayerId",
                table: "MoraBowlingPerformances",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraFieldingPerformances_InningsId",
                table: "MoraFieldingPerformances",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_MoraFieldingPerformances_PlayerId",
                table: "MoraFieldingPerformances",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentBattingPerformances_BattingStyle",
                table: "OpponentBattingPerformances",
                column: "BattingStyle");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentBattingPerformances_DismissedByMoraBowlerId",
                table: "OpponentBattingPerformances",
                column: "DismissedByMoraBowlerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentBattingPerformances_FieldedByMoraPlayerId",
                table: "OpponentBattingPerformances",
                column: "FieldedByMoraPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentBattingPerformances_InningsId",
                table: "OpponentBattingPerformances",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentBattingPerformances_OpponentPlayerId",
                table: "OpponentBattingPerformances",
                column: "OpponentPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentBowlingPerformances_BowlingStyle",
                table: "OpponentBowlingPerformances",
                column: "BowlingStyle");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentBowlingPerformances_InningsId",
                table: "OpponentBowlingPerformances",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentBowlingPerformances_OpponentPlayerId",
                table: "OpponentBowlingPerformances",
                column: "OpponentPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentPlayers_BattingStyle",
                table: "OpponentPlayers",
                column: "BattingStyle");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentPlayers_BowlingStyle",
                table: "OpponentPlayers",
                column: "BowlingStyle");

            migrationBuilder.CreateIndex(
                name: "IX_OpponentPlayers_OpponentId",
                table: "OpponentPlayers",
                column: "OpponentId");

            migrationBuilder.CreateIndex(
                name: "IX_Opponents_Name",
                table: "Opponents",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OverSummaries_InningsId",
                table: "OverSummaries",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_OverSummaries_InningsId_OverNumber",
                table: "OverSummaries",
                columns: new[] { "InningsId", "OverNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Partnerships_InningsId",
                table: "Partnerships",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_Partnerships_MoraBatter1Id_MoraBatter2Id",
                table: "Partnerships",
                columns: new[] { "MoraBatter1Id", "MoraBatter2Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Partnerships_MoraBatter2Id",
                table: "Partnerships",
                column: "MoraBatter2Id");

            migrationBuilder.CreateIndex(
                name: "IX_Partnerships_OppBatter1Id",
                table: "Partnerships",
                column: "OppBatter1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Partnerships_OppBatter2Id",
                table: "Partnerships",
                column: "OppBatter2Id");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerMilestones_MatchId",
                table: "PlayerMilestones",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerMilestones_PlayerId_MilestoneType",
                table: "PlayerMilestones",
                columns: new[] { "PlayerId", "MilestoneType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Players_BatchYear",
                table: "Players",
                column: "BatchYear");

            migrationBuilder.CreateIndex(
                name: "IX_Players_BattingStyle",
                table: "Players",
                column: "BattingStyle");

            migrationBuilder.CreateIndex(
                name: "IX_Players_IsActive",
                table: "Players",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Players_PrimaryBowlingStyle",
                table: "Players",
                column: "PrimaryBowlingStyle");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSeasons_PlayerId_SeasonId",
                table: "PlayerSeasons",
                columns: new[] { "PlayerId", "SeasonId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSeasons_SeasonId",
                table: "PlayerSeasons",
                column: "SeasonId");

            migrationBuilder.CreateIndex(
                name: "IX_Seasons_Name",
                table: "Seasons",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_SeasonId",
                table: "Tournaments",
                column: "SeasonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BowlingMilestones");

            migrationBuilder.DropTable(
                name: "FallOfWickets");

            migrationBuilder.DropTable(
                name: "MatchSquads");

            migrationBuilder.DropTable(
                name: "MoraBattingOrders");

            migrationBuilder.DropTable(
                name: "MoraBattingPerformances");

            migrationBuilder.DropTable(
                name: "MoraBowlingPerformances");

            migrationBuilder.DropTable(
                name: "MoraFieldingPerformances");

            migrationBuilder.DropTable(
                name: "OpponentBattingPerformances");

            migrationBuilder.DropTable(
                name: "OpponentBowlingPerformances");

            migrationBuilder.DropTable(
                name: "OverSummaries");

            migrationBuilder.DropTable(
                name: "Partnerships");

            migrationBuilder.DropTable(
                name: "PlayerMilestones");

            migrationBuilder.DropTable(
                name: "PlayerSeasons");

            migrationBuilder.DropTable(
                name: "Deliveries");

            migrationBuilder.DropTable(
                name: "Innings");

            migrationBuilder.DropTable(
                name: "OpponentPlayers");

            migrationBuilder.DropTable(
                name: "Matches");

            migrationBuilder.DropTable(
                name: "Opponents");

            migrationBuilder.DropTable(
                name: "Players");

            migrationBuilder.DropTable(
                name: "Tournaments");

            migrationBuilder.DropTable(
                name: "Venues");

            migrationBuilder.DropTable(
                name: "Seasons");
        }
    }
}
