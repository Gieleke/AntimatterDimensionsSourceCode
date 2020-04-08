"use strict";

class SingularityMilestoneState extends GameMechanicState {

    get start() {
        return this.config.start;
    }

    get repeat() {
        return this.config.repeat;
    }

    get limit() {
        return this.config.limit;
    }

    get isUnique() {
        return this.repeat === 0;
    }

    get isUnlocked() {
        return player.celestials.laitela.singularities >= this.start;
    }

    get previousGoal() {
        if (!this.isUnlocked) return 0;
        return this.start * Math.pow(this.repeat, this.completions - 1);
    }

    get nextGoal() {
        return this.start * Math.pow(this.repeat, this.completions);
    }

    get completions() {
        if (this.isUnique) return this.isUnlocked ? 1 : 0;
        if (!this.isUnlocked) return 0;

        return Math.floor(1 + Math.log(player.celestials.laitela.singularities) / 
            Math.log(this.repeat - Math.log(this.start) / Math.log(this.repeat)));
    }

    get remainingSingularities() {
        return this.nextGoal - player.celestials.laitela.singularities;
    }

    get progressToNext() {
        return (player.celestials.laitela.singularities - this.previousGoal) / this.nextGoal;
    }

    get isMaxed() {
        return (this.isUnique && this.isUnlocked) ||
               (this.limit !== 0 && this.completions >= this.limit);
    }

    get effect() {
        return this.config.effect(this.completions);
    }

    get effectDisplay() {
        if (this.effect === Infinity) return "Infinity";
        return this.config.effectFormat(this.effect);
    }

    get nextEffectDisplay() {
        return this.config.effectFormat(this.config.effect(this.completions + 1));
    }

    get description() {
        return this.config.description;
    }
}


const SingularityMilestone = SingularityMilestoneState.createAccessor(GameDatabase.celestials.singularityMilestones);

const SingularityMilestones = {
  all: SingularityMilestone.index.compact(),

  get sorted() {
    return this.all
        .sort((a, b) => a.remainingSingularities - b.remainingSingularities);
  },

  get sortedForCompletions() {
    return this.sorted
        .sort((a, b) => {
            if (a.isMaxed === b.isMaxed) return 0;
            return a.isMaxed ? 1 : -1;
        });
  },

  get nextFive() {
    return this.sortedForCompletions
        .slice(0, 5);
  }
};

const Singularity = {

    get cap() {
        return 1e4 * Math.pow(10, player.celestials.laitela.singularityCapIncreases);
    },

    get singularitiesGained() {
        return Math.pow(20, player.celestials.laitela.singularityCapIncreases);
    },

    get capIsReached() {
        return player.celestials.laitela.darkEnergy > this.cap;
    },

    perform() {
        if (!this.capIsReached) return;

        player.celestials.laitela.darkEnergy = 0;
        player.celestials.laitela.singularities += this.singularitiesGained;
    }
};