using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class PlayerMilestoneConfiguration : IEntityTypeConfiguration<PlayerMilestone>
{
    public void Configure(EntityTypeBuilder<PlayerMilestone> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.MilestoneType).HasConversion<string>();
        builder.Property(m => m.Detail).HasMaxLength(200);

        // Each player can only have one of each milestone type
        builder.HasIndex(m => new { m.PlayerId, m.MilestoneType }).IsUnique();

        builder.HasOne(m => m.Player)
            .WithMany(p => p.Milestones)
            .HasForeignKey(m => m.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Match)
            .WithMany()
            .HasForeignKey(m => m.MatchId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
