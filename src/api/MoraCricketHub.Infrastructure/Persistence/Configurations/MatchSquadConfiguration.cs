using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class MatchSquadConfiguration : IEntityTypeConfiguration<MatchSquad>
{
    public void Configure(EntityTypeBuilder<MatchSquad> builder)
    {
        builder.HasKey(ms => ms.Id);
        builder.HasIndex(ms => new { ms.MatchId, ms.PlayerId }).IsUnique();

        builder.HasOne(ms => ms.Match)
            .WithMany(m => m.Squad)
            .HasForeignKey(ms => ms.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ms => ms.Player)
            .WithMany(p => p.MatchSquads)
            .HasForeignKey(ms => ms.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
