using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class PlayerSeasonConfiguration : IEntityTypeConfiguration<PlayerSeason>
{
    public void Configure(EntityTypeBuilder<PlayerSeason> builder)
    {
        builder.HasKey(ps => ps.Id);
        builder.Property(ps => ps.BattingRole).HasConversion<string>();

        builder.HasIndex(ps => new { ps.PlayerId, ps.SeasonId }).IsUnique();
        builder.HasIndex(ps => ps.SeasonId);

        builder.HasOne(ps => ps.Player)
            .WithMany(p => p.Seasons)
            .HasForeignKey(ps => ps.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ps => ps.Season)
            .WithMany()
            .HasForeignKey(ps => ps.SeasonId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
