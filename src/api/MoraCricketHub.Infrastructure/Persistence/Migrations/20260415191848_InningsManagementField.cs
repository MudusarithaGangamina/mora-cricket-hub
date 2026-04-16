using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoraCricketHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InningsManagementField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "EndedAtOver",
                table: "Innings",
                type: "numeric(4,1)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "Innings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsConfirmed",
                table: "Innings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxOvers",
                table: "Innings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScheduledOvers",
                table: "Innings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Target",
                table: "Innings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsMidOverBowlerChange",
                table: "Deliveries",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "InningsEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InningsId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AtOver = table.Column<decimal>(type: "numeric(4,1)", nullable: true),
                    EndedAtOver = table.Column<decimal>(type: "numeric(4,1)", nullable: true),
                    TeamScoreAtEvent = table.Column<int>(type: "integer", nullable: true),
                    TeamWicketsAtEvent = table.Column<int>(type: "integer", nullable: true),
                    RevisedOvers = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InningsEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InningsEvents_Innings_InningsId",
                        column: x => x.InningsId,
                        principalTable: "Innings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InningsEvents_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_InningsEvents_EventType",
                table: "InningsEvents",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_InningsEvents_InningsId",
                table: "InningsEvents",
                column: "InningsId");

            migrationBuilder.CreateIndex(
                name: "IX_InningsEvents_PlayerId",
                table: "InningsEvents",
                column: "PlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InningsEvents");

            migrationBuilder.DropColumn(
                name: "EndedAtOver",
                table: "Innings");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "Innings");

            migrationBuilder.DropColumn(
                name: "IsConfirmed",
                table: "Innings");

            migrationBuilder.DropColumn(
                name: "MaxOvers",
                table: "Innings");

            migrationBuilder.DropColumn(
                name: "ScheduledOvers",
                table: "Innings");

            migrationBuilder.DropColumn(
                name: "Target",
                table: "Innings");

            migrationBuilder.DropColumn(
                name: "IsMidOverBowlerChange",
                table: "Deliveries");
        }
    }
}
