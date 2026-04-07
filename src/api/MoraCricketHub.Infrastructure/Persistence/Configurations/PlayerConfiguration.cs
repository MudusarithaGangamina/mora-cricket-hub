using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.FullName).HasMaxLength(100).IsRequired();
        builder.Property(p => p.ShortName).HasMaxLength(30).IsRequired();
        builder.Property(p => p.Nickname).HasMaxLength(30);
        builder.Property(p => p.PhotoUrl).HasMaxLength(300);
        builder.Property(p => p.Faculty).HasMaxLength(100);
        builder.Property(p => p.Degree).HasMaxLength(100);
        builder.Property(p => p.BattingStyle).HasConversion<string>();
        builder.Property(p => p.PrimaryBowlingStyle).HasConversion<string>();

        builder.HasIndex(p => p.BatchYear);
        builder.HasIndex(p => p.BattingStyle);
        builder.HasIndex(p => p.PrimaryBowlingStyle);
        builder.HasIndex(p => p.IsActive);
    }
}
