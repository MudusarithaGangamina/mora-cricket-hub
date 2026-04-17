using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class MatchOpponentSquadConfiguration
    : IEntityTypeConfiguration<MatchOpponentSquad>
{
    public void Configure(EntityTypeBuilder<MatchOpponentSquad> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.PlayerName).HasMaxLength(100).IsRequired();
        builder.Property(m => m.BattingStyle).HasMaxLength(5);
        builder.Property(m => m.BowlingStyle).HasMaxLength(5);

        builder.HasIndex(m => m.MatchId);

        builder.HasOne(m => m.Match)
            .WithMany()
            .HasForeignKey(m => m.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.OpponentPlayer)
            .WithMany()
            .HasForeignKey(m => m.OpponentPlayerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
