using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class InningsConfiguration : IEntityTypeConfiguration<Innings>
{
    public void Configure(EntityTypeBuilder<Innings> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.InningsType).HasConversion<string>();
        builder.Property(i => i.BattingTeam).HasConversion<string>();
        builder.Property(i => i.CommentaryCoverage).HasConversion<string>();
        builder.Property(i => i.TotalOversFaced).HasColumnType("decimal(4,1)");

        builder.HasIndex(i => i.MatchId);
        builder.HasIndex(i => i.BattingTeam);
        builder.HasIndex(i => i.HasDeliveryData);

        builder.HasOne(i => i.Match)
            .WithMany(m => m.Innings)
            .HasForeignKey(i => i.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.MoraWickekeeper)
            .WithMany()
            .HasForeignKey(i => i.MoraWickeeperId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
