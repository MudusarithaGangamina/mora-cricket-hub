using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoraCricketHub.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AutoEventsAndPartnershipTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndedAtOver",
                table: "InningsEvents");

            migrationBuilder.AddColumn<decimal>(
                name: "EndedAtOver",
                table: "Partnerships",
                type: "numeric(4,1)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Partnerships",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "StartedAtOver",
                table: "Partnerships",
                type: "numeric(4,1)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Partnerships_InningsId_IsActive",
                table: "Partnerships",
                columns: new[] { "InningsId", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Partnerships_InningsId_IsActive",
                table: "Partnerships");

            migrationBuilder.DropColumn(
                name: "EndedAtOver",
                table: "Partnerships");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Partnerships");

            migrationBuilder.DropColumn(
                name: "StartedAtOver",
                table: "Partnerships");

            migrationBuilder.AddColumn<decimal>(
                name: "EndedAtOver",
                table: "InningsEvents",
                type: "numeric(4,1)",
                nullable: true);
        }
    }
}
