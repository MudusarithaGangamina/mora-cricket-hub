using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoraCricketHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchOpponentSquad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MatchOpponentSquads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    OpponentPlayerId = table.Column<Guid>(type: "uuid", nullable: true),
                    PlayerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BattingStyle = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    BowlingStyle = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    BattingOrder = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchOpponentSquads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchOpponentSquads_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MatchOpponentSquads_OpponentPlayers_OpponentPlayerId",
                        column: x => x.OpponentPlayerId,
                        principalTable: "OpponentPlayers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MatchOpponentSquads_MatchId",
                table: "MatchOpponentSquads",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchOpponentSquads_OpponentPlayerId",
                table: "MatchOpponentSquads",
                column: "OpponentPlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatchOpponentSquads");
        }
    }
}
