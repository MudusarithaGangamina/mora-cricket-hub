using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class OpponentPlayerConfiguration : IEntityTypeConfiguration<OpponentPlayer>
{
    public void Configure(EntityTypeBuilder<OpponentPlayer> builder)
    {
        builder.HasKey(op => op.Id);
        builder.Property(op => op.FullName).HasMaxLength(100).IsRequired();
        builder.Property(op => op.Notes).HasMaxLength(200);
        builder.Property(op => op.BattingStyle).HasConversion<string>();
        builder.Property(op => op.BowlingStyle).HasConversion<string>();

        // Critical indexes for matchup analysis
        builder.HasIndex(op => op.BowlingStyle);
        builder.HasIndex(op => op.BattingStyle);
        builder.HasIndex(op => op.OpponentId);

        builder.HasOne(op => op.Opponent)
            .WithMany(o => o.Players)
            .HasForeignKey(op => op.OpponentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
